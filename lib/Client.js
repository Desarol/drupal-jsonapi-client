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
                _context.next = 2;
                return this.transport("".concat(this.baseUrl || '', "/rest/session/token"));

              case 2:
                response = _context.sent;
                return _context.abrupt("return", response.text());

              case 4:
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
        var url, body, cache, credentials, headers, integrity, method, mode, redirect, referrer, referrerPolicy, copy, xCsrfToken, i;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                url = request.url, body = request.body, cache = request.cache, credentials = request.credentials, headers = request.headers, integrity = request.integrity, method = request.method, mode = request.mode, redirect = request.redirect, referrer = request.referrer, referrerPolicy = request.referrerPolicy;
                copy = new Request(this.baseUrl + url, {
                  body: body,
                  cache: cache,
                  credentials: credentials,
                  headers: headers,
                  integrity: integrity,
                  method: method,
                  mode: mode,
                  redirect: redirect,
                  referrer: referrer,
                  referrerPolicy: referrerPolicy
                });

                if (!(this.sendCookies === true)) {
                  _context2.next = 8;
                  break;
                }

                _context2.next = 5;
                return this._fetchCSRFToken();

              case 5:
                xCsrfToken = _context2.sent;
                copy.headers.set('X-CSRF-Token', xCsrfToken);
                copy.credentials = 'same-origin';

              case 8:
                if (typeof this.authorization === 'string') {
                  copy.headers.set('Authorization', this.authorization);
                }

                i = 0;

              case 10:
                if (!(i < this.middleware.length)) {
                  _context2.next = 17;
                  break;
                }

                _context2.next = 13;
                return this.middleware[i](request);

              case 13:
                copy = _context2.sent;

              case 14:
                i += 1;
                _context2.next = 10;
                break;

              case 17:
                return _context2.abrupt("return", this.transport(copy));

              case 18:
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