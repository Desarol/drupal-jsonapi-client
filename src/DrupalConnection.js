import idx from 'idx'
import DrupalEntity from './DrupalEntity'

export default class DrupalConnection {
  constructor({
    transport,
    baseUrl,
    authorization,
    sendCookies = true,
  }) {
    this.transport = transport
    this.baseUrl = baseUrl
    this.authorization = authorization
    this.sendCookies = sendCookies
  }

  async _fetchCSRFToken() {
    const response = await this.transport(`${this.baseUrl}/rest/session/token`)
    return response.text()
  }

  _authorizeRequest(request) {
    const copy = request.clone()
    if (!this.authorization) {
      return request
    }
    copy.headers.set('Authorization', this.authorization)
    return copy
  }

  async _sendCookies(request) {
    const copy = request.clone()
    const xCsrfToken = await this._fetchCSRFToken()
    copy.headers.set('X-CSRF-Token', xCsrfToken)
    copy.credentials = 'same-origin'
    return copy
  }

  async send(request) {
    let appliedRequest

    if (this.authorization) {
      appliedRequest = this._authorizeRequest(appliedRequest)
    }

    if (this.sendCookies) {
      appliedRequest = await this._sendCookies(request)
    }

    return this.transport(appliedRequest)
  }

  async getDrupalEntity(entityType, entityBundle, entityUuid) {
    const drupalEntity = new DrupalEntity(entityType, entityBundle, entityUuid)
    const response = await this.send(drupalEntity.toJsonApiGetRequest(this.baseUrl))
    const json = await response.json()
    drupalEntity._applySerializedData(idx(json, _ => _.data[0]))
    return drupalEntity
  }
}
