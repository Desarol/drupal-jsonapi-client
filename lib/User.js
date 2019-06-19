"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Entity2 = _interopRequireDefault(require("./Entity"));

var _Filter = _interopRequireDefault(require("./Filter"));

var _GlobalClient = _interopRequireDefault(require("./GlobalClient"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

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
        var response1, data1, userEntities, userEntity;
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
                  body: JSON.stringify({
                    name: username,
                    pass: password
                  })
                });

              case 2:
                response1 = _context.sent;
                _context.next = 5;
                return response1.data;

              case 5:
                data1 = _context.sent;
                _context.next = 8;
                return _Entity2.default.LoadMultiple({
                  entityType: 'user',
                  entityBundle: 'user',
                  filter: new _Filter.default({
                    identifier: 'user-name',
                    path: 'name',
                    value: data1.current_user.name
                  })
                });

              case 8:
                userEntities = _context.sent;
                userEntity = new User(userEntities[0].entityUuid, data1.csrf_token);

                userEntity._applySerializedData(userEntities[0]._serialize().data);

                return _context.abrupt("return", userEntity);

              case 12:
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
      regeneratorRuntime.mark(function _callee2(email, username, password) {
        var csrfToken, response1, data1, userEntities, userEntity;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _GlobalClient.default._fetchCSRFToken();

              case 2:
                csrfToken = _context2.sent;
                _context2.next = 5;
                return _GlobalClient.default.send({
                  url: '/user/register?_format=json',
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                  },
                  body: JSON.stringify({
                    name: username,
                    mail: email,
                    'pass[pass1]': password,
                    'pass[pass2]': password
                  })
                });

              case 5:
                response1 = _context2.sent;
                _context2.next = 8;
                return response1.data;

              case 8:
                data1 = _context2.sent;
                _context2.next = 11;
                return _Entity2.default.LoadMultiple({
                  entityType: 'user',
                  entityBundle: 'user',
                  filter: new _Filter.default({
                    identifier: 'user-name',
                    path: 'name',
                    value: data1.current_user.name
                  })
                });

              case 11:
                userEntities = _context2.sent;
                userEntity = new User();
                userEntity._csrfToken = data1.crsf_token;

                userEntity._applySerializedData(userEntities[0]._serialize().data);

                return _context2.abrupt("return", userEntity);

              case 16:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function Register(_x3, _x4, _x5) {
        return _Register.apply(this, arguments);
      }

      return Register;
    }()
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

  }, {
    key: "SendConfirmation",
    value: function () {
      var _SendConfirmation = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(email, username) {
        var csrfToken, response1;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return _GlobalClient.default._fetchCSRFToken();

              case 2:
                csrfToken = _context3.sent;
                _context3.next = 5;
                return _GlobalClient.default.send({
                  url: '/user/register?_format=json',
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                  },
                  body: JSON.stringify({
                    name: username,
                    mail: email
                  })
                });

              case 5:
                response1 = _context3.sent;
                return _context3.abrupt("return", response1.data);

              case 7:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function SendConfirmation(_x6, _x7) {
        return _SendConfirmation.apply(this, arguments);
      }

      return SendConfirmation;
    }()
    /**
     * Create a new Drupal user.
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
      regeneratorRuntime.mark(function _callee4(email, username, password) {
        var userEnabled,
            user,
            response,
            json,
            _args4 = arguments;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                userEnabled = _args4.length > 3 && _args4[3] !== undefined ? _args4[3] : true;
                user = new User(null, null);
                user.setAttribute('mail', email);
                user.setAttribute('name', username);
                user.setAttribute('pass', password);
                user.setAttribute('status', userEnabled);
                _context4.next = 8;
                return user.save();

              case 8:
                response = _context4.sent;
                _context4.next = 11;
                return response.data;

              case 11:
                json = _context4.sent;

                user._applySerializedData(json.data);

                return _context4.abrupt("return", user);

              case 14:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function Create(_x8, _x9, _x10) {
        return _Create.apply(this, arguments);
      }

      return Create;
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