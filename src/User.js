import Entity from './Entity'
import Filter from './Filter'
import GlobalClient from './GlobalClient'

export default class User extends Entity {
  static async Login(username, password) {
    const response1 = await GlobalClient.send(new Request('/user/login?_format=json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: username,
        pass: password,
      }),
    }))
    const data1 = await response1.json()

    // We need to fetch by UID because /user/login doesn't return UUID
    const userEntities = await Entity.LoadMultiple({
      entityType: 'user',
      entityBundle: 'user',
      filter: new Filter({
        identifier: 'user-name',
        path: 'name',
        value: data1.current_user.name,
      }),
    })

    const userEntity = new User(userEntities[0].entityUuid, data1.csrf_token)
    userEntity._applySerializedData(userEntities[0]._serialize().data)
    return userEntity
  }

  /**
   * Register a new user with Drupal.
   *
   * To use this:
   *  - enable REST resource /user/register
   *  - allow users to enroll without email confirmation
   *
   * @param {string} email
   * @param {string} username
   * @param {string} password
   */
  static async Register(email, username, password) {
    const csrfToken = await GlobalClient._fetchCSRFToken()
    const response1 = await GlobalClient.send(new Request('/user/register?_format=json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({
        name: username,
        mail: email,
        'pass[pass1]': password,
        'pass[pass2]': password,
      }),
    }))
    const data1 = await response1.json()
    const userEntities = await Entity.LoadMultiple({
      entityType: 'user',
      entityBundle: 'user',
      filter: new Filter({
        identifier: 'user-name',
        path: 'name',
        value: data1.current_user.name,
      }),
    })

    const userEntity = new User()
    userEntity._csrfToken = data1.crsf_token
    userEntity._applySerializedData(userEntities[0]._serialize().data)
    return userEntity
  }

  /**
   * Send an email confirmation to enroll a user.
   *
   * To use this:
   *  - enable REST resource /user/register
   *
   * @param {string} email
   * @param {string} username
   *
   * @return {object} response from /user/register
   */
  static async SendConfirmation(email, username) {
    const csrfToken = await GlobalClient._fetchCSRFToken()
    const response1 = await GlobalClient.send(new Request('/user/register?_format=json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({
        name: username,
        mail: email,
      }),
    }))
    return response1.json()
  }

  constructor(uuid, csrfToken) {
    super('user', 'user', uuid)
    this._csrfToken = csrfToken
  }

  setDefault() {
    GlobalClient.user = this
  }
}
