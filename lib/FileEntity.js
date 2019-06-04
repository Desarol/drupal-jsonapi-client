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

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

// File class does not exist in node.js
if (!File || !FileReader) {
  global.File = {};

  global.FileReader = function FileReader() {};
} // Named FileEntity to avoid namespace collisions in browsers


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
        var binary, response, json, fileEntity;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(fileOrBinary instanceof File)) {
                  _context.next = 6;
                  break;
                }

                _context.next = 3;
                return new Promise(function (resolve) {
                  var fr = new FileReader();

                  fr.onload = function (event) {
                    resolve(event.target.result);
                  };

                  fr.readAsArrayBuffer(fileOrBinary);
                });

              case 3:
                binary = _context.sent;
                _context.next = 7;
                break;

              case 6:
                binary = fileOrBinary;

              case 7:
                _context.next = 9;
                return _GlobalClient.default.send(new Request("/jsonapi/".concat(entityType, "/").concat(entityBundle, "/").concat(fieldName), {
                  method: 'POST',
                  headers: {
                    Accept: 'application/vnd.api+json',
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': "file; filename=\"".concat(name, "\"")
                  },
                  body: binary
                }));

              case 9:
                response = _context.sent;
                _context.next = 12;
                return response.json();

              case 12:
                json = _context.sent;
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
  }]);

  function FileEntity(uuid) {
    _classCallCheck(this, FileEntity);

    return _possibleConstructorReturn(this, _getPrototypeOf(FileEntity).call(this, 'file', 'file', uuid));
  }

  return FileEntity;
}(_Entity2.default);

exports.default = FileEntity;