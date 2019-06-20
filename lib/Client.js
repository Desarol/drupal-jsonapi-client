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
                return this.send({
                  url: '/rest/session/token',
                  method: 'GET'
                });

              case 4:
                response = _context.sent;
                return _context.abrupt("return", response.data);

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
        var xCsrfToken, requestCopy, i, response;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (this.transport) {
                  _context2.next = 2;
                  break;
                }

                throw new Error('No HTTP transport method provided. Pass a transport function to your Client or set GlobalClient.transport.');

              case 2:
                request.baseURL = this.baseUrl;
                request.headers = request.headers || {};

                if (!(this.sendCookies === true)) {
                  _context2.next = 11;
                  break;
                }

                request.withCredentials = true; // When authenticating using cookies, X-CSRF-Token header must be set

                if (!(request.url.indexOf('/rest/session/token') === -1)) {
                  _context2.next = 11;
                  break;
                }

                _context2.next = 9;
                return this._fetchCSRFToken();

              case 9:
                xCsrfToken = _context2.sent;
                request.headers['X-CSRF-Token'] = xCsrfToken;

              case 11:
                if (typeof this.authorization === 'string') {
                  request.headers.Authorization = this.authorization;
                }

                requestCopy = request;
                i = 0;

              case 14:
                if (!(i < this.middleware.length)) {
                  _context2.next = 21;
                  break;
                }

                _context2.next = 17;
                return this.middleware[i](requestCopy);

              case 17:
                requestCopy = _context2.sent;

              case 18:
                i += 1;
                _context2.next = 14;
                break;

              case 21:
                response = this.transport(requestCopy);

                if (response) {
                  _context2.next = 24;
                  break;
                }

                throw new Error("HTTP transport returned ".concat(response, ". Expected a Response."));

              case 24:
                return _context2.abrupt("return", response);

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