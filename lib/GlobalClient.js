"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _axios = _interopRequireDefault(require("axios"));

var _Client = _interopRequireDefault(require("./Client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const GlobalClient = new _Client.default({
  transport: _axios.default.request,
  baseUrl: '',
  authorization: null,
  sendCookies: false,
  middleware: []
});
var _default = GlobalClient;
exports.default = _default;