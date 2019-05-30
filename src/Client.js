import Entity from './Entity'
import EntityNotFound from './Error/EntityNotFound'

/* eslint-disable */
if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth) {
    var flattend = [];
    (function flat(array, depth) {
      for (let el of array) {
        if (Array.isArray(el) && depth > 0) {
          flat(el, depth - 1); 
        } else {
          flattend.push(el);
        }
      }
    })(this, Math.floor(depth) || 1);
    return flattend;
  };
}
/* eslint-enable */

export default class Client {
  static _QueryParameterize(queryParameterArray) {
    return queryParameterArray.flat().filter(item => item !== '').map(item => (item.query ? item.query() : item)).join('&')
  }

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
    this.cache = {}
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
   * Remove cached representations of entities.
   */
  clearCache() {
    this.cache = {}
  }

  /**
   * Get a single entity.
   *
   * @param {string} entityType
   * @param {string} entityBundle
   * @param {string} entityUuid
   * @param {boolean} refreshCache
   */
  async getEntity(entityType, entityBundle, entityUuid, refreshCache = false) {
    if (this.cache[entityUuid] && refreshCache === false) {
      const entity = new Entity()
      entity._applySerializedData(this.cache[entityUuid])
      return entity
    }

    const response = await this.send(new Request(`/jsonapi/${entityType}/${entityBundle}/${entityUuid}`))
    const json = await response.json()
    const entity = new Entity()
    if (json && json.data) {
      entity._applySerializedData(json.data)
      this.cache[entityUuid] = entity._serialize()
      return entity
    }

    throw new EntityNotFound(`Failed to find entity matching entity type ${entityType}, entity bundle ${entityBundle} and uuid ${entityUuid}`)
  }

  /**
   * Get entities matching provided filters.
   *
   * @param {object}              config
   *
   * @param {string}              config.entityType
   * @param {string}              config.entityBundle
   * @param {Filter|FilterGroup}  config.filterOrFilterGroup  default = {}
   * @param {number}              config.pageOffset           default = 0
   * @param {number}              config.pageLimit            default = 50
   */
  async getEntities({
    entityType,
    entityBundle,
    filterOrFilterGroup = {},
    pageOffset = 0,
    pageLimit = 50,
  }) {
    const filterQuery = filterOrFilterGroup.query ? filterOrFilterGroup.query() : []
    const sortQuery = [`page[offset]=${pageOffset}`, `page[limit]=${pageLimit}`]
    const query = Client._QueryParameterize([filterQuery, sortQuery])

    const response = await this.send(new Request(`/jsonapi/${entityType}/${entityBundle}?${query}`))
    const json = await response.json()

    if (json && json.data && json.data.length && json.data.length > 0) {
      return json.data.map((item) => {
        const entity = new Entity()
        entity._applySerializedData(item)
        return entity
      })
    }
    return json.data
  }
}
