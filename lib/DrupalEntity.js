"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FetchDrupalEntity = exports.DrupalEntityFromSerializedRequiredFields = exports.DrupalEntityFromResponse = exports.SendCookies = exports.AuthorizeRequest = exports.default = exports.MalformedEntity = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

if (process.env.BABEL_ENV === 'test') {
  require('regenerator-runtime/runtime'); // eslint-disable-line


  require('cross-fetch/polyfill'); // eslint-disable-line

}

var TypeHeaders = {
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json'
};

var MalformedEntity =
/*#__PURE__*/
function (_Error) {
  _inherits(MalformedEntity, _Error);

  function MalformedEntity() {
    _classCallCheck(this, MalformedEntity);

    return _possibleConstructorReturn(this, _getPrototypeOf(MalformedEntity).apply(this, arguments));
  }

  return MalformedEntity;
}(_wrapNativeSuper(Error));

exports.MalformedEntity = MalformedEntity;

var DrupalEntity =
/*#__PURE__*/
function () {
  function DrupalEntity(entityType, entityBundle, entityUuid, entityVersionId, requiredFieldsSerializationFields) {
    var _this = this;

    _classCallCheck(this, DrupalEntity);

    this.entityType = entityType;
    this.entityBundle = entityBundle;
    this.entityUuid = entityUuid || null;
    this._entityId = null;
    this._versionId = entityVersionId || null;
    this._requiredFields = requiredFieldsSerializationFields || null;
    this._attributes = {};
    this._relationships = {};
    this._changes = {
      attributes: {},
      relationships: {}
    };

    if (this._requiredFields) {
      this._requiredFields.forEach(function (field) {
        if (field.field_type !== 'entity_reference') {
          _this.editAttribute(field.field_name, '');
        } else {
          _this.editRelationship(field.field_name, {
            data: {}
          });
        }
      });
    }
  }

  _createClass(DrupalEntity, [{
    key: "_applySerializedData",
    value: function _applySerializedData(jsonApiSerialization) {
      var _jsonApiSerialization = jsonApiSerialization.type.split('--'),
          _jsonApiSerialization2 = _slicedToArray(_jsonApiSerialization, 2),
          entityType = _jsonApiSerialization2[0],
          entityBundle = _jsonApiSerialization2[1];

      this.entityType = entityType;
      this.entityBundle = entityBundle;
      this.entityUuid = jsonApiSerialization.id;
      this._entityId = jsonApiSerialization.attributes.drupal_internal__nid;
      this._versionId = jsonApiSerialization.attributes.drupal_internal__vid;
      this._attributes = jsonApiSerialization.attributes;
      this._relationships = Object.keys(jsonApiSerialization.relationships).map(function (key) {
        return {
          data: jsonApiSerialization.relationships[key].data,
          _$key: key
        };
      }).reduce(function (prev, curr) {
        var key = curr._$key;
        var copy = curr;
        delete copy._$key;
        return _objectSpread({}, prev, _defineProperty({}, key, copy));
      }, {});
    }
  }, {
    key: "_serializeChanges",
    value: function _serializeChanges() {
      var serialization = {
        data: {
          type: "".concat(this.entityType, "--").concat(this.entityBundle),
          attributes: this._changes.attributes,
          relationships: this._changes.relationships
        }
      };

      if (Object.keys(serialization.data.attributes).length === 0) {
        delete serialization.data.attributes;
      }

      if (Object.keys(serialization.data.relationships).length === 0) {
        delete serialization.data.relationships;
      }

      if (this.entityUuid) {
        serialization.data.id = this.entityUuid;
      }

      return serialization;
    }
  }, {
    key: "_serializeChangesForField",
    value: function _serializeChangesForField(fieldName) {
      return {
        data: this.getChange(fieldName)
      };
    }
  }, {
    key: "_serialize",
    value: function _serialize() {
      var serialization = {
        data: {
          type: "".concat(this.entityType, "--").concat(this.entityBundle),
          attributes: this._attributes,
          relationships: this._relationships
        }
      };

      if (Object.keys(serialization.data.attributes).length === 0) {
        delete serialization.data.attributes;
      }

      if (Object.keys(serialization.data.relationships).length === 0) {
        delete serialization.data.relationships;
      }

      return serialization;
    }
  }, {
    key: "nodeId",
    value: function nodeId() {
      return this._entityId;
    }
  }, {
    key: "versionId",
    value: function versionId() {
      return this._versionId;
    }
  }, {
    key: "get",
    value: function get(fieldName) {
      return this._attributes[fieldName] || this._relationships[fieldName];
    }
  }, {
    key: "getChange",
    value: function getChange(fieldName) {
      return this._changes.attributes[fieldName] || this._changes.relationships[fieldName];
    }
    /**
     * Edit an attribute.
     *
     * @param {string} fieldName - Drupal machine name for the field
     * @param {any} fieldValue - value to send to JSON:API
     */

  }, {
    key: "editAttribute",
    value: function editAttribute(fieldName, fieldValue) {
      this._attributes[fieldName] = fieldValue;
      this._changes.attributes[fieldName] = fieldValue;
    }
    /**
     * Edit a relationship.
     *
     * @param {string} fieldName - Drupal machine name for the field
     * @param {any} fieldValue - value to send to JSON:API
     */

  }, {
    key: "editRelationship",
    value: function editRelationship(fieldName, fieldValue) {
      this._relationships[fieldName] = fieldValue;
      this._changes.relationships[fieldName] = fieldValue;
    }
  }, {
    key: "toJsonApiGetRequest",
    value: function toJsonApiGetRequest(baseUrl) {
      return new Request("".concat(baseUrl || '', "/jsonapi/").concat(this.entityType, "/").concat(this.entityBundle, "?filter[id]=").concat(this.entityUuid), {
        headers: TypeHeaders
      });
    }
  }, {
    key: "toUploadFileRequest",
    value: function () {
      var _toUploadFileRequest = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(baseUrl, fieldName, file) {
        var binary;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return new Promise(function (resolve) {
                  var fr = new FileReader();

                  fr.onload = function (event) {
                    resolve(event.target.result);
                  };

                  fr.readAsArrayBuffer(file);
                });

              case 2:
                binary = _context.sent;
                return _context.abrupt("return", this.uploadBinary(baseUrl, fieldName, file.name, binary));

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function toUploadFileRequest(_x, _x2, _x3) {
        return _toUploadFileRequest.apply(this, arguments);
      }

      return toUploadFileRequest;
    }()
  }, {
    key: "toUploadBinaryRequest",
    value: function toUploadBinaryRequest(fieldName, fileName, binary, baseUrl) {
      return new Request("".concat(baseUrl || '', "/jsonapi/").concat(this.entityType, "/").concat(this.entityBundle, "/").concat(fieldName), {
        method: 'POST',
        headers: _objectSpread({}, TypeHeaders, {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': "file; filename=\"".concat(fileName, "\"")
        }),
        body: binary
      });
    }
  }, {
    key: "toPostRequest",
    value: function toPostRequest(baseUrl) {
      return new Request("".concat(baseUrl || '', "/jsonapi/").concat(this.entityType, "/").concat(this.entityBundle), {
        method: 'POST',
        headers: _objectSpread({}, TypeHeaders),
        body: JSON.stringify(this._serialize())
      });
    }
  }, {
    key: "toPatchRequest",
    value: function toPatchRequest(baseUrl) {
      if (!this.entityUuid) {
        throw new MalformedEntity('Entity is missing UUID but was used in a PATCH request.');
      }

      return new Request("".concat(baseUrl || '', "/jsonapi/").concat(this.entityType, "/").concat(this.entityBundle, "/").concat(this.entityUuid), {
        method: 'PATCH',
        headers: _objectSpread({}, TypeHeaders),
        body: JSON.stringify(this._serializeChanges())
      });
    }
  }, {
    key: "toPatchRequestForRelationship",
    value: function toPatchRequestForRelationship(fieldName, baseUrl) {
      if (!this.entityUuid) {
        throw new MalformedEntity('Entity is missing UUID but was used in a PATCH request.');
      }

      return new Request("".concat(baseUrl || '', "/jsonapi/").concat(this.entityType, "/").concat(this.entityBundle, "/").concat(this.entityUuid, "/relationships/").concat(fieldName), {
        method: 'PATCH',
        headers: _objectSpread({}, TypeHeaders),
        body: JSON.stringify(this._serializeChangesForField(fieldName))
      });
    }
    /**
     * Get required fields for this entity.
     *
     * @param {string} baseUrl
     */

  }, {
    key: "toFieldConfigRequest",
    value: function toFieldConfigRequest(baseUrl) {
      return new Request("".concat(baseUrl || '', "/jsonapi/field_config/field_config?filter[entity_type]=").concat(this.entityType, "&filter[bundle]=").concat(this.entityBundle), {
        headers: _objectSpread({}, TypeHeaders)
      });
    }
  }]);

  return DrupalEntity;
}();

exports.default = DrupalEntity;

var AuthorizeRequest = function AuthorizeRequest(request, authorizationHeaderValue) {
  var copy = request.clone();

  if (!authorizationHeaderValue) {
    return request;
  }

  copy.headers.set('Authorization', authorizationHeaderValue);
  return copy;
};

exports.AuthorizeRequest = AuthorizeRequest;

var SendCookies = function SendCookies(request, xCsrfToken) {
  if (!xCsrfToken) {
    return request;
  }

  var url = request.url,
      body = request.body,
      cache = request.cache,
      headers = request.headers,
      integrity = request.integrity,
      method = request.method,
      mode = request.mode,
      redirect = request.redirect,
      referrer = request.referrer,
      referrerPolicy = request.referrerPolicy;
  headers.set('X-CSRF-Token', xCsrfToken);
  return new Request(url, {
    body: body,
    cache: cache,
    credentials: 'same-origin',
    headers: headers,
    integrity: integrity,
    method: method,
    mode: mode,
    redirect: redirect,
    referrer: referrer,
    referrerPolicy: referrerPolicy
  });
};

exports.SendCookies = SendCookies;

var DrupalEntityFromResponse = function DrupalEntityFromResponse(jsonApiSerialization) {
  var entity = new DrupalEntity();

  entity._applySerializedData(jsonApiSerialization);

  return entity;
};

exports.DrupalEntityFromResponse = DrupalEntityFromResponse;

var DrupalEntityFromSerializedRequiredFields = function DrupalEntityFromSerializedRequiredFields(requiredFieldsSerialization) {
  var entity = new DrupalEntity(requiredFieldsSerialization.entity_type, requiredFieldsSerialization.entity_bundle, null, null, requiredFieldsSerialization.fields);
  return entity;
};

exports.DrupalEntityFromSerializedRequiredFields = DrupalEntityFromSerializedRequiredFields;

var FetchDrupalEntity =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(drupalEntity, baseUrl, authorizationHeaderValue) {
    var _ref;

    var request, response, json;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            request = drupalEntity.toJsonApiGetRequest(baseUrl);

            if (authorizationHeaderValue) {
              request = AuthorizeRequest(request, authorizationHeaderValue);
            }

            _context2.next = 4;
            return fetch(request);

          case 4:
            response = _context2.sent;
            _context2.next = 7;
            return response.json();

          case 7:
            json = _context2.sent;
            return _context2.abrupt("return", drupalEntity._applySerializedData((_ref = json) != null ? (_ref = _ref.data) != null ? _ref[0] : _ref : _ref));

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function FetchDrupalEntity(_x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

exports.FetchDrupalEntity = FetchDrupalEntity;