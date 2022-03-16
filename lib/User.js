"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Entity = _interopRequireDefault(require("./Entity"));

var _GlobalClient = _interopRequireDefault(require("./GlobalClient"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class User extends _Entity.default {
  static async Login(username, password) {
    const response = await _GlobalClient.default.send({
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
    return response.data;
  }
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


  static async Register(email, username) {
    let password = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    const body = {
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

    const csrfToken = await _GlobalClient.default._fetchCSRFToken();
    const response = await _GlobalClient.default.send({
      url: '/user/register?_format=json',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken
      },
      data: JSON.stringify(body)
    });
    return response.data;
  }
  /**
   * Create a new Drupal user.
   * This should be used for server-side enrollment or client-side admin forms.
   *
   * @param {string} email
   * @param {string} username
   * @param {string} password
   * @param {boolean} userEnabled
   */


  static async Create(email, username, password) {
    let userEnabled = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    const user = new User(null, null);
    user.setAttribute('mail', email);
    user.setAttribute('name', username);
    user.setAttribute('pass', password);
    user.setAttribute('status', userEnabled);
    const response = await user.save();
    const json = response.data;

    user._applySerializedData(json.data);

    return user;
  }

  static async Load(uuid) {
    let includeRelationships = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let refreshCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    return super.Load('user', 'user', uuid, includeRelationships, refreshCache);
  }

  constructor(uuid, csrfToken) {
    super('user', 'user', uuid);
    this._csrfToken = csrfToken;
  }

  setDefault() {
    _GlobalClient.default.user = this;
  }

}

exports.default = User;