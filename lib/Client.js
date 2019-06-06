"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Client =
/*#__PURE__*/
function () {
  function Client(_ref) {
    var transport = _ref.transport,
        baseUrl = _ref.baseUrl,
        authorization = _ref.authorization,
        _ref$sendCookies = _ref.sendCookies,
        sendCookies = _ref$sendCookies === void 0 ? false : _ref$sendCookies,
        _ref$middleware = _ref.middleware,
        middleware = _ref$middleware === void 0 ? [] : _ref$middleware;

    _classCallCheck(this, Client);

    this.transport = transport;
    this.baseUrl = baseUrl;
    this.authorization = authorization;
    this.sendCookies = sendCookies;
    this.middleware = middleware;
    this.user = null;
  }

  _createClass(Client, [{
    key: "_fetchCSRFToken",
    value: function () {
      var _fetchCSRFToken2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.user && this.user._csrfToken)) {
                  _context.next = 2;
                  break;
                }

                return _context.abrupt("return", this.user._csrfToken);

              case 2:
                _context.next = 4;
                return this.send(new Request("".concat(this.baseUrl || '', "/rest/session/token")));

              case 4:
                response = _context.sent;
                return _context.abrupt("return", response.text());

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _fetchCSRFToken() {
        return _fetchCSRFToken2.apply(this, arguments);
      }

      return _fetchCSRFToken;
    }()
  }, {
    key: "send",
    value: function () {
      var _send = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(request) {
        var url, body, cache, credentials, headers, integrity, method, mode, redirect, referrer, referrerPolicy, credentialsCopy, urlCopy, urlObject, bodyCopy, copy, xCsrfToken, i;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                url = request.url, body = request.body, cache = request.cache, credentials = request.credentials, headers = request.headers, integrity = request.integrity, method = request.method, mode = request.mode, redirect = request.redirect, referrer = request.referrer, referrerPolicy = request.referrerPolicy; // node.js Request doesn't have cookies

                credentialsCopy = this.sendCookies === true ? 'same-origin' : credentials; // Browser Request.url is prefixed with origin when not origin not specified

                urlCopy = url;

                try {
                  urlObject = new URL(url);
                  urlCopy = urlObject.pathname;
                } catch (err) {}
                /* noop */
                // Browser Request.body is undefined


                bodyCopy = body;

                if (!(bodyCopy === undefined && method !== 'GET')) {
                  _context2.next = 9;
                  break;
                }

                _context2.next = 8;
                return request.text();

              case 8:
                bodyCopy = _context2.sent;

              case 9:
                copy = new Request(this.baseUrl + urlCopy, {
                  body: bodyCopy,
                  cache: cache,
                  credentials: credentialsCopy,
                  headers: headers,
                  integrity: integrity,
                  method: method,
                  mode: mode,
                  redirect: redirect,
                  referrer: referrer,
                  referrerPolicy: referrerPolicy
                });

                if (!(this.sendCookies === true && url.indexOf('/rest/session/token') === -1)) {
                  _context2.next = 15;
                  break;
                }

                _context2.next = 13;
                return this._fetchCSRFToken();

              case 13:
                xCsrfToken = _context2.sent;
                copy.headers.set('X-CSRF-Token', xCsrfToken);

              case 15:
                if (typeof this.authorization === 'string') {
                  copy.headers.set('Authorization', this.authorization);
                }

                i = 0;

              case 17:
                if (!(i < this.middleware.length)) {
                  _context2.next = 24;
                  break;
                }

                _context2.next = 20;
                return this.middleware[i](copy);

              case 20:
                copy = _context2.sent;

              case 21:
                i += 1;
                _context2.next = 17;
                break;

              case 24:
                return _context2.abrupt("return", this.transport(copy));

              case 25:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function send(_x) {
        return _send.apply(this, arguments);
      }

      return send;
    }()
  }]);

  return Client;
}();

exports.default = Client;