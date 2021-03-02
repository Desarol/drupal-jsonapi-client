"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GlobalClient = _interopRequireDefault(require("./GlobalClient"));

var _Entity2 = _interopRequireDefault(require("./Entity"));

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

(function PolyfillFiles(scope) {
  if (scope.File) {
    return;
  }

  scope.File = function File() {}; // eslint-disable-line


  scope.FileReader = function FileReader() {}; // eslint-disable-line

})(typeof process !== 'undefined' && {}.toString.call(process) === '[object process]' || typeof navigator !== 'undefined' && navigator.product === 'ReactNative' ? global : self // eslint-disable-line
); // Named FileEntity to avoid namespace collisions in browsers


var FileEntity =
/*#__PURE__*/
function (_Entity) {
  _inherits(FileEntity, _Entity);

  _createClass(FileEntity, null, [{
    key: "Upload",
    value: function () {
      var _Upload = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(fileOrBinary, name, entityType, entityBundle, fieldName) {
        var fileName, binary, response, json, fileEntity;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                fileName = name;

                if (!(fileOrBinary instanceof File)) {
                  _context.next = 8;
                  break;
                }

                _context.next = 4;
                return new Promise(function (resolve) {
                  var fr = new FileReader();

                  fr.onload = function (event) {
                    resolve(event.target.result);
                  };

                  fr.readAsArrayBuffer(fileOrBinary);
                });

              case 4:
                binary = _context.sent;

                if (name === null) {
                  fileName = fileOrBinary.name;
                }

                _context.next = 9;
                break;

              case 8:
                binary = fileOrBinary;

              case 9:
                _context.next = 11;
                return _GlobalClient.default.send({
                  url: "/jsonapi/".concat(entityType, "/").concat(entityBundle, "/").concat(fieldName),
                  method: 'POST',
                  headers: {
                    Accept: 'application/vnd.api+json',
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': "file; filename=\"".concat(fileName, "\"")
                  },
                  data: binary
                });

              case 11:
                response = _context.sent;
                json = response.data;
                fileEntity = new FileEntity();

                fileEntity._applySerializedData(json.data);

                return _context.abrupt("return", fileEntity);

              case 16:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function Upload(_x, _x2, _x3, _x4, _x5) {
        return _Upload.apply(this, arguments);
      }

      return Upload;
    }()
  }, {
    key: "Load",
    value: function () {
      var _Load = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(fileUuid) {
        var includeRelationships,
            refreshCache,
            _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                includeRelationships = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : [];
                refreshCache = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : false;
                return _context2.abrupt("return", _get(_getPrototypeOf(FileEntity), "Load", this).call(this, 'file', 'file', fileUuid, includeRelationships, refreshCache));

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function Load(_x6) {
        return _Load.apply(this, arguments);
      }

      return Load;
    }()
    /**
     * Delete a remote file.
     *
     * @param {string} fileUuid
     */

  }, {
    key: "Delete",
    value: function () {
      var _Delete = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(fileUuid) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", _get(_getPrototypeOf(FileEntity), "Delete", this).call(this, 'file', 'file', fileUuid));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function Delete(_x7) {
        return _Delete.apply(this, arguments);
      }

      return Delete;
    }()
  }]);

  function FileEntity(uuid) {
    _classCallCheck(this, FileEntity);

    return _possibleConstructorReturn(this, _getPrototypeOf(FileEntity).call(this, 'file', 'file', uuid));
  }

  return FileEntity;
}(_Entity2.default);

exports.default = FileEntity;