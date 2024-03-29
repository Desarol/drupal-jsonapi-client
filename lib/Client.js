"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Client {
  constructor(_ref) {
    let {
      transport,
      baseUrl,
      authorization,
      sendCookies = false,
      middleware = []
    } = _ref;
    this.transport = transport;
    this.baseUrl = baseUrl;
    this.authorization = authorization;
    this.sendCookies = sendCookies;
    this.middleware = middleware;
    this.user = null;
  }

  async _fetchCSRFToken() {
    if (this.user && this.user._csrfToken) {
      return this.user._csrfToken;
    }

    const response = await this.send({
      url: '/rest/session/token',
      method: 'GET'
    });
    return response.data;
  }

  async send(request) {
    if (!this.transport) {
      throw new Error('No HTTP transport method provided. Pass a transport function to your Client or set GlobalClient.transport.');
    }

    request.baseURL = this.baseUrl;
    request.headers = request.headers || {};

    if (this.sendCookies === true) {
      request.withCredentials = true; // When authenticating using cookies, X-CSRF-Token header must be set

      if (request.url.indexOf('/rest/session/token') === -1) {
        const xCsrfToken = await this._fetchCSRFToken();
        request.headers['X-CSRF-Token'] = xCsrfToken;
      }
    }

    if (typeof this.authorization === 'string') {
      request.headers.Authorization = this.authorization;
    }

    let requestCopy = request;

    for (let i = 0; i < this.middleware.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      requestCopy = await this.middleware[i](requestCopy);
    }

    const response = this.transport(requestCopy);

    if (!response) {
      throw new Error(`HTTP transport returned ${response}. Expected a Response.`);
    }

    return response;
  }

}

exports.default = Client;