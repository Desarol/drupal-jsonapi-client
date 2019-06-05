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
    this.user = null
  }

  async _fetchCSRFToken() {
    if (this.user && this.user._csrfToken) {
      return this.user._csrfToken
    }

    const response = await this.send(new Request(`${this.baseUrl || ''}/rest/session/token`))
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

    // node.js Request doesn't have cookies
    const credentialsCopy = this.sendCookies === true ? 'same-origin' : credentials

    // Browser Request.url is prefixed with origin when not origin not specified
    let urlCopy = url
    try {
      const urlObject = new URL(url)
      urlCopy = urlObject.pathname
    } catch (err) { /* noop */ }

    let copy = new Request(this.baseUrl + urlCopy, {
      body,
      cache,
      credentials: credentialsCopy,
      headers,
      integrity,
      method,
      mode,
      redirect,
      referrer,
      referrerPolicy,
    })

    if (this.sendCookies === true && url.indexOf('/rest/session/token') === -1) {
      const xCsrfToken = await this._fetchCSRFToken()
      copy.headers.set('X-CSRF-Token', xCsrfToken)
    }

    if (typeof this.authorization === 'string') {
      copy.headers.set('Authorization', this.authorization)
    }

    for (let i = 0; i < this.middleware.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      copy = await this.middleware[i](copy)
    }

    return this.transport(copy)
  }
}
