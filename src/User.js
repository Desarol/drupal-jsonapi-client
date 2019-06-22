import Entity from './Entity'
import GlobalClient from './GlobalClient'

export default class User extends Entity {
  static async Login(username, password) {
    const response = await GlobalClient.send({
      url: '/user/login?_format=json',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({
        name: username,
        pass: password,
      }),
    })
    return response.data
  }

  /**
   * Register a new user with Drupal.
   * This should be used for client-side registration forms.
   *
   * To use this:
   *  - enable REST resource /user/register
   *  - allow users to enroll without email confirmation
   *
   * @param {string} email
   * @param {string} username
   * @param {string} password
   */
  static async Register(email, username, password = null) {
    const body = {
      name: [{ value: username }],
      mail: [{ value: email }],
      pass: [{ value: password }],
    }
    if (password === null) {
      delete body.pass
    }
    const csrfToken = await GlobalClient._fetchCSRFToken()
    const response = await GlobalClient.send({
      url: '/user/register?_format=json',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      data: JSON.stringify(body),
    })
    return response.data
  }

  /**
   * Create a new Drupal user.
   * This should be used for server-side enrollment or client-side admin forms.
   *
   * @param {string} email
   * @param {string} username
   * @param {string} password
   * @param {boolean} userEnabled
   */
  static async Create(email, username, password, userEnabled = true) {
    const user = new User(null, null)
    user.setAttribute('mail', email)
    user.setAttribute('name', username)
    user.setAttribute('pass', password)
    user.setAttribute('status', userEnabled)
    const response = await user.save()
    const json = response.data
    user._applySerializedData(json.data)
    return user
  }

  static async Load(uuid, includeRelationships = [], refreshCache = false) {
    return super.Load('user', 'user', uuid, includeRelationships, refreshCache)
  }

  constructor(uuid, csrfToken) {
    super('user', 'user', uuid)
    this._csrfToken = csrfToken
  }

  setDefault() {
    GlobalClient.user = this
  }
}
