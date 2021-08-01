"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Resource = _interopRequireDefault(require("./Resource"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class FileResource extends _Resource.default {
  static New({
    type,
    field,
    file,
    fileName
  }) {
    const [p1, p2] = type.split('--');
    return {
      url: `/${p1}/${p2}/${field}`,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `file; filename="${fileName}"`
      },
      data: file
    };
  }

}

var _default = FileResource;
exports.default = _default;