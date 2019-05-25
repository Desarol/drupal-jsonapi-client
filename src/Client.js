import Entity from './Entity'
import EntityNotFound from './Error/EntityNotFound'

export default class Client {
  constructor({
    transport,
    baseUrl,
    authorization,
    sendCookies = false,
    middleware = [],
  }) {
    this.transport = transport
    this.baseUrl = baseUrl
    this.authorization = authorization
    this.sendCookies = sendCookies
    this.middleware = middleware
  }

  async _fetchCSRFToken() {
    const response = await this.transport(`${this.baseUrl || ''}/rest/session/token`)
    return response.text()
  }

  async send(request) {
    const {
      url,
      body,
      cache,
      credentials,
      headers,
      integrity,
      method,
      mode,
      redirect,
      referrer,
      referrerPolicy,
    } = request;

    let copy = new Request(this.baseUrl + url, {
      body,
      cache,
      credentials,
      headers,
      integrity,
      method,
      mode,
      redirect,
      referrer,
      referrerPolicy,
    })

    if (this.sendCookies === true) {
      const xCsrfToken = await this._fetchCSRFToken()
      copy.headers.set('X-CSRF-Token', xCsrfToken)
      copy.credentials = 'same-origin'
    }

    if (typeof this.authorization === 'string') {
      copy.headers.set('Authorization', this.authorization)
    }

    for (let i = 0; i < this.middleware.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      copy = await this.middleware[i](request)
    }

    return this.transport(copy)
  }

  /**
   * Get a single entity.
   *
   * @param {string} entityType
   * @param {string} entityBundle
   * @param {string} entityUuid
   */
  async getEntity(entityType, entityBundle, entityUuid) {
    const response = await this.send(new Request(`${this.baseUrl || ''}/jsonapi/${entityType}/${entityBundle}?filter[id]=${entityUuid}`))
    const json = await response.json()
    const entity = new Entity()
    if (json && json.data && json.data.length && json.data[0]) {
      entity._applySerializedData(json.data[0])
      return entity
    }

    throw new EntityNotFound(`Failed to find entity matching entity type ${entityType}, entity bundle ${entityBundle} and uuid ${entityUuid}`)
  }

  /**
   * Get all matching entities.
   *
   * @param {string} entityType
   * @param {string} entityBundle
   * @param {object} filters
   */
  async getEntities(entityType, entityBundle, filters) {
    console.log(this.baseUrl, entityType, entityBundle, filters)
  }
}
