"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Client = _interopRequireDefault(require("./Client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GlobalClient = new _Client.default({
  transport: function transport() {},
  baseUrl: '',
  authorization: null,
  sendCookies: false,
  middleware: []
});
var _default = GlobalClient;
exports.default = _default;