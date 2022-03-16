"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GlobalClient = _interopRequireDefault(require("./GlobalClient"));

var _Entity = _interopRequireDefault(require("./Entity"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function PolyfillFiles(scope) {
  if (scope.File) {
    return;
  }

  scope.File = function File() {}; // eslint-disable-line


  scope.FileReader = function FileReader() {}; // eslint-disable-line

})(typeof process !== 'undefined' && {}.toString.call(process) === '[object process]' || typeof navigator !== 'undefined' && navigator.product === 'ReactNative' ? global : self // eslint-disable-line
); // Named FileEntity to avoid namespace collisions in browsers


class FileEntity extends _Entity.default {
  static async Upload(fileOrBinary, name, entityType, entityBundle, fieldName) {
    let fileName = name;
    let binary;

    if (fileOrBinary instanceof File) {
      binary = await new Promise(resolve => {
        const fr = new FileReader();

        fr.onload = event => {
          resolve(event.target.result);
        };

        fr.readAsArrayBuffer(fileOrBinary);
      });

      if (name === null) {
        fileName = fileOrBinary.name;
      }
    } else {
      binary = fileOrBinary;
    }

    const response = await _GlobalClient.default.send({
      url: `/jsonapi/${entityType}/${entityBundle}/${fieldName}`,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `file; filename="${fileName}"`
      },
      data: binary
    });
    const json = response.data;
    const fileEntity = new FileEntity();

    fileEntity._applySerializedData(json.data);

    return fileEntity;
  }

  static async Load(fileUuid) {
    let includeRelationships = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let refreshCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    return super.Load('file', 'file', fileUuid, includeRelationships, refreshCache);
  }
  /**
   * Delete a remote file.
   *
   * @param {string} fileUuid
   */


  static async Delete(fileUuid) {
    return super.Delete('file', 'file', fileUuid);
  }

  constructor(uuid) {
    super('file', 'file', uuid);
  }

}

exports.default = FileEntity;