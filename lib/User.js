"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Entity2 = _interopRequireDefault(require("./Entity"));

var _GlobalClient = _interopRequireDefault(require("./GlobalClient"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var User =
/*#__PURE__*/
function (_Entity) {
  _inherits(User, _Entity);

  _createClass(User, null, [{
    key: "Login",
    value: function () {
      var _Login = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(username, password) {
        var response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _GlobalClient.default.send({
                  url: '/user/login?_format=json',
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: JSON.stringify({
                    name: username,
                    pass: password
                  })
                });

              case 2:
                response = _context.sent;
                return _context.abrupt("return", response.data);

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function Login(_x, _x2) {
        return _Login.apply(this, arguments);
      }

      return Login;
    }()
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

  }, {
    key: "Register",
    value: function () {
      var _Register = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(email, username) {
        var password,
            body,
            csrfToken,
            response,
            _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                password = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : null;
                body = {
                  name: [{
                    value: username
                  }],
                  mail: [{
                    value: email
                  }],
                  pass: [{
                    value: password
                  }]
                };

                if (password === null) {
                  delete body.pass;
                }

                _context2.next = 5;
                return _GlobalClient.default._fetchCSRFToken();

              case 5:
                csrfToken = _context2.sent;
                _context2.next = 8;
                return _GlobalClient.default.send({
                  url: '/user/register?_format=json',
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                  },
                  data: JSON.stringify(body)
                });

              case 8:
                response = _context2.sent;
                return _context2.abrupt("return", response.data);

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function Register(_x3, _x4) {
        return _Register.apply(this, arguments);
      }

      return Register;
    }()
    /**
     * Create a new Drupal user.
     * This should be used for server-side enrollment or client-side admin forms.
     *
     * @param {string} email
     * @param {string} username
     * @param {string} password
     * @param {boolean} userEnabled
     */

  }, {
    key: "Create",
    value: function () {
      var _Create = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(email, username, password) {
        var userEnabled,
            user,
            response,
            json,
            _args3 = arguments;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                userEnabled = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : true;
                user = new User(null, null);
                user.setAttribute('mail', email);
                user.setAttribute('name', username);
                user.setAttribute('pass', password);
                user.setAttribute('status', userEnabled);
                _context3.next = 8;
                return user.save();

              case 8:
                response = _context3.sent;
                json = response.data;

                user._applySerializedData(json.data);

                return _context3.abrupt("return", user);

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function Create(_x5, _x6, _x7) {
        return _Create.apply(this, arguments);
      }

      return Create;
    }()
  }, {
    key: "Load",
    value: function () {
      var _Load = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(uuid) {
        var includeRelationships,
            refreshCache,
            _args4 = arguments;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                includeRelationships = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : [];
                refreshCache = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : false;
                return _context4.abrupt("return", _get(_getPrototypeOf(User), "Load", this).call(this, 'user', 'user', uuid, includeRelationships, refreshCache));

              case 3:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function Load(_x8) {
        return _Load.apply(this, arguments);
      }

      return Load;
    }()
  }]);

  function User(uuid, csrfToken) {
    var _this;

    _classCallCheck(this, User);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(User).call(this, 'user', 'user', uuid));
    _this._csrfToken = csrfToken;
    return _this;
  }

  _createClass(User, [{
    key: "setDefault",
    value: function setDefault() {
      _GlobalClient.default.user = this;
    }
  }]);

  return User;
}(_Entity2.default);

exports.default = User;