"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _EntityNotFound = _interopRequireDefault(require("./Error/EntityNotFound"));

var _MalformedEntity = _interopRequireDefault(require("./Error/MalformedEntity"));

var _GlobalClient = _interopRequireDefault(require("./GlobalClient"));

var _QueryParameters = _interopRequireDefault(require("./QueryParameters"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TypeHeaders = {
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json'
};

var Entity =
/*#__PURE__*/
function () {
  _createClass(Entity, null, [{
    key: "FromResponse",
    value: function FromResponse(response) {
      var entity = new Entity();

      entity._applySerializedData(response);

      return entity;
    }
    /**
     * Get a single entity.
     *
     * @param {string} entityType
     * @param {string} entityBundle
     * @param {string} entityUuid
     * @param {string[]} includeRelationships   default = []
     * @param {boolean} refreshCache            default = false
     */

  }, {
    key: "Load",
    value: function () {
      var _Load = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(entityType, entityBundle, entityUuid) {
        var includeRelationships,
            refreshCache,
            queryParameters,
            response,
            json,
            entity,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                includeRelationships = _args.length > 3 && _args[3] !== undefined ? _args[3] : [];
                refreshCache = _args.length > 4 && _args[4] !== undefined ? _args[4] : false;

                if (!(Entity.Cache[entityUuid] && refreshCache === false)) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt("return", Entity.FromResponse(Entity.Cache[entityUuid]));

              case 4:
                queryParameters = new _QueryParameters.default(["include=".concat(includeRelationships.join(','))]);
                _context.next = 7;
                return _GlobalClient.default.send({
                  url: "/jsonapi/".concat(entityType, "/").concat(entityBundle, "/").concat(entityUuid).concat(includeRelationships.length > 0 ? "?".concat(queryParameters.toString()) : ''),
                  method: 'GET',
                  headers: TypeHeaders
                });

              case 7:
                response = _context.sent;
                json = response.data;

                if (!(json && json.data)) {
                  _context.next = 14;
                  break;
                }

                entity = Entity.FromResponse(json.data);
                Entity.Cache[entityUuid] = entity._serialize().data; // Warm EntityCache so future requests for .expand can pull from cache

                if (json.included) {
                  json.included.forEach(function (includedData) {
                    var includedEntity = Entity.FromResponse(includedData);
                    Entity.Cache[includedEntity.entityUuid] = includedEntity._serialize().data;
                  });
                }

                return _context.abrupt("return", entity);

              case 14:
                throw new _EntityNotFound.default("Failed to find entity matching entity type ".concat(entityType, ", entity bundle ").concat(entityBundle, " and uuid ").concat(entityUuid));

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function Load(_x, _x2, _x3) {
        return _Load.apply(this, arguments);
      }

      return Load;
    }()
    /**
     * Get entities matching provided filters.
     *
     * @param {object}              config
     *
     * @param {string}              config.entityType
     * @param {string}              config.entityBundle
     * @param {Filter|FilterGroup}  config.filter               default = {}
     * @param {number}              config.pageOffset           default = 0
     * @param {number}              config.pageLimit            default = 50
     */

  }, {
    key: "LoadMultiple",
    value: function () {
      var _LoadMultiple = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(_ref) {
        var entityType, entityBundle, _ref$filter, filter, _ref$include, include, _ref$pageOffset, pageOffset, _ref$pageLimit, pageLimit, filterQuery, queryParameters, response, json;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                entityType = _ref.entityType, entityBundle = _ref.entityBundle, _ref$filter = _ref.filter, filter = _ref$filter === void 0 ? {} : _ref$filter, _ref$include = _ref.include, include = _ref$include === void 0 ? [] : _ref$include, _ref$pageOffset = _ref.pageOffset, pageOffset = _ref$pageOffset === void 0 ? 0 : _ref$pageOffset, _ref$pageLimit = _ref.pageLimit, pageLimit = _ref$pageLimit === void 0 ? 50 : _ref$pageLimit;
                filterQuery = typeof filter.query === 'function' ? filter.query() : filter;
                queryParameters = new _QueryParameters.default([filterQuery, include.length > 0 ? "include=".concat(include.join(',')) : null, "page[offset]=".concat(pageOffset), "page[limit]=".concat(pageLimit)]);
                _context2.next = 5;
                return _GlobalClient.default.send({
                  url: "/jsonapi/".concat(entityType, "/").concat(entityBundle, "?").concat(queryParameters.toString(Number.MAX_SAFE_INTEGER)),
                  method: 'GET',
                  headers: TypeHeaders
                });

              case 5:
                response = _context2.sent;
                json = response.data;

                if (!(json && json.data && json.data.length && json.data.length > 0)) {
                  _context2.next = 10;
                  break;
                }

                // Warm EntityCache so future requests for .expand can pull from cache
                if (json.included && json.included.length) {
                  json.included.forEach(function (includedData) {
                    var includedEntity = new Entity();

                    includedEntity._applySerializedData(includedData);

                    Entity.Cache[includedEntity.entityUuid] = includedEntity._serialize().data;
                  });
                }

                return _context2.abrupt("return", json.data.map(function (item) {
                  var entity = new Entity();

                  entity._applySerializedData(item);

                  Entity.Cache[entity.entityUuid] = entity._serialize().data;
                  return entity;
                }));

              case 10:
                return _context2.abrupt("return", json.data);

              case 11:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function LoadMultiple(_x4) {
        return _LoadMultiple.apply(this, arguments);
      }

      return LoadMultiple;
    }()
    /**
     * Delete a remote entity.
     *
     * @param {string} entityType
     * @param {string} entityBundle
     * @param {string} entityUuid
     */

  }, {
    key: "Delete",
    value: function () {
      var _Delete = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(entityType, entityBundle, entityUuid) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Entity(entityType, entityBundle, entityUuid).delete());

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function Delete(_x5, _x6, _x7) {
        return _Delete.apply(this, arguments);
      }

      return Delete;
    }()
  }]);

  function Entity(entityType, entityBundle, entityUuid) {
    _classCallCheck(this, Entity);

    this.entityType = entityType;
    this.entityBundle = entityBundle;
    this.entityUuid = entityUuid || null;
    this._enforceNew = false;
    this._attributes = {};
    this._relationships = {};
    this._changes = {
      attributes: {},
      relationships: {} // Setup proxy behaviour for fields

    };
    return new Proxy(this, {
      get: function get(target, key) {
        var fieldName = key;
        var fieldNameTransformations = {
          nid: 'drupal_internal__nid',
          vid: 'drupal_internal__vid'
        };

        if (fieldName in fieldNameTransformations) {
          fieldName = fieldNameTransformations[fieldName];
        }

        if (!(fieldName in target)) {
          if (target._hasField(fieldName)) {
            return target.get(key);
          }
        }

        return target[key];
      },
      set: function set(target, key, value) {
        var fieldName = key;
        var fieldNameTransformations = {
          nid: 'drupal_internal__nid',
          vid: 'drupal_internal__vid'
        };

        if (fieldName in fieldNameTransformations) {
          fieldName = fieldNameTransformations[fieldName];
        }

        if (!(fieldName in target)) {
          if (target._attributes[fieldName]) {
            target.setAttribute(fieldName, value); // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/set
            // Must return true if property was set successfully

            return true;
          }

          if (target._relationships[fieldName]) {
            target.setRelationship(fieldName, value);
            return true;
          }
        } // eslint-disable-next-line no-param-reassign


        target[fieldName] = value;
        return true;
      }
    });
  }

  _createClass(Entity, [{
    key: "_applySerializedData",
    value: function _applySerializedData(jsonApiSerialization) {
      var _jsonApiSerialization = jsonApiSerialization.type.split('--'),
          _jsonApiSerialization2 = _slicedToArray(_jsonApiSerialization, 2),
          entityType = _jsonApiSerialization2[0],
          entityBundle = _jsonApiSerialization2[1];

      this.entityType = entityType;
      this.entityBundle = entityBundle;
      this.entityUuid = jsonApiSerialization.id;
      this._attributes = jsonApiSerialization.attributes || {};

      if (jsonApiSerialization.relationships) {
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
      } else {
        this._relationships = {};
      }
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
    key: "_hasField",
    value: function _hasField(fieldName) {
      return fieldName in this._attributes || fieldName in this._relationships;
    }
    /**
     * Get field value.
     *
     * @param {string} fieldName
     */

  }, {
    key: "get",
    value: function get(fieldName) {
      return this._attributes[fieldName] !== undefined ? this._attributes[fieldName] : this._relationships[fieldName];
    }
    /**
     * Get local changes for this entity.
     *
     * @param {string} fieldName
     */

  }, {
    key: "getChange",
    value: function getChange(fieldName) {
      return this._changes.attributes[fieldName] !== undefined ? this._changes.attributes[fieldName] : this._changes.relationships[fieldName];
    }
    /**
     * Get an expanded representation of a related entity.
     *
     * @param {string} fieldName
     */

  }, {
    key: "expand",
    value: function () {
      var _expand = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(fieldName) {
        var _this$_relationships$, _this$_relationships$2, entityType, entityBundle;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (this._relationships[fieldName]) {
                  _context4.next = 2;
                  break;
                }

                throw new _MalformedEntity.default("Failed to find related entity from field ".concat(fieldName));

              case 2:
                if (!(this._relationships[fieldName].data && this._relationships[fieldName].data.type && typeof this._relationships[fieldName].data.type === 'string' && this._relationships[fieldName].data.id)) {
                  _context4.next = 5;
                  break;
                }

                _this$_relationships$ = this._relationships[fieldName].data.type.split('--'), _this$_relationships$2 = _slicedToArray(_this$_relationships$, 2), entityType = _this$_relationships$2[0], entityBundle = _this$_relationships$2[1];
                return _context4.abrupt("return", Entity.Load(entityType, entityBundle, this._relationships[fieldName].data.id));

              case 5:
                throw new _MalformedEntity.default("Related field ".concat(fieldName, " doesn't have sufficient information to expand."));

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function expand(_x8) {
        return _expand.apply(this, arguments);
      }

      return expand;
    }()
    /**
     * Set an attribute.
     *
     * @param {string} fieldName - Drupal machine name for the field
     * @param {any} fieldValue - value to send to JSON:API
     */

  }, {
    key: "setAttribute",
    value: function setAttribute(fieldName, fieldValue) {
      this._attributes[fieldName] = fieldValue;
      this._changes.attributes[fieldName] = fieldValue;
    }
    /**
     * Set a relationship.
     *
     * @param {string} fieldName - Drupal machine name for the field
     * @param {any} fieldValue - value to send to JSON:API
     */

  }, {
    key: "setRelationship",
    value: function setRelationship(fieldName, fieldValue) {
      var value = fieldValue;

      if (fieldValue instanceof Entity) {
        value = {
          data: {
            type: "".concat(fieldValue.entityType, "--").concat(fieldValue.entityBundle),
            id: fieldValue.entityUuid
          }
        };
      }

      this._relationships[fieldName] = value;
      this._changes.relationships[fieldName] = value;
    }
    /**
     * Take a File and upload it to Drupal.
     *
     * @param {string} fieldName
     * @param {File} file
     */

  }, {
    key: "_toUploadFileRequest",
    value: function () {
      var _toUploadFileRequest2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(fieldName, file) {
        var binary;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return new Promise(function (resolve) {
                  var fr = new FileReader();

                  fr.onload = function (event) {
                    resolve(event.target.result);
                  };

                  fr.readAsArrayBuffer(file);
                });

              case 2:
                binary = _context5.sent;
                return _context5.abrupt("return", this.toUploadBinaryRequest(fieldName, file.name, binary));

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _toUploadFileRequest(_x9, _x10) {
        return _toUploadFileRequest2.apply(this, arguments);
      }

      return _toUploadFileRequest;
    }()
    /**
     * @deprecated use _toUploadBinaryRequest
     *
     * @param {string} fieldName
     * @param {string} fileName
     * @param {any} binary
     */

  }, {
    key: "toUploadBinaryRequest",
    value: function toUploadBinaryRequest(fieldName, fileName, binary) {
      return {
        url: "/jsonapi/".concat(this.entityType, "/").concat(this.entityBundle, "/").concat(fieldName),
        method: 'POST',
        headers: _objectSpread({}, TypeHeaders, {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': "file; filename=\"".concat(fileName, "\"")
        }),
        data: binary
      };
    }
  }, {
    key: "_toPostRequest",
    value: function _toPostRequest() {
      return {
        url: "/jsonapi/".concat(this.entityType, "/").concat(this.entityBundle),
        method: 'POST',
        headers: _objectSpread({}, TypeHeaders),
        data: JSON.stringify(this._serialize())
      };
    }
  }, {
    key: "_toPatchRequest",
    value: function _toPatchRequest() {
      if (!this.entityUuid) {
        throw new _MalformedEntity.default('Entity is missing UUID but was used in a PATCH request.');
      }

      return {
        url: "/jsonapi/".concat(this.entityType, "/").concat(this.entityBundle, "/").concat(this.entityUuid),
        method: 'PATCH',
        headers: _objectSpread({}, TypeHeaders),
        data: JSON.stringify(this._serializeChanges())
      };
    }
    /**
     * Build a request to save the entity.
     *
     * This will be either a POST or a PATCH depending on
     * whether or not this is a new entity.
     */

  }, {
    key: "_toSaveRequest",
    value: function _toSaveRequest() {
      return this._enforceNew === true || !this.entityUuid ? this._toPostRequest() : this._toPatchRequest();
    }
    /**
     * Save this entity.
     */

  }, {
    key: "save",
    value: function save() {
      return _GlobalClient.default.send(this._toSaveRequest());
    }
    /**
     * Build a request to delete the entity.
     *
     * This will return a DELETE request.
     */

  }, {
    key: "_toDeleteRequest",
    value: function _toDeleteRequest() {
      if (!this.entityUuid) {
        throw new _MalformedEntity.default('Cannot delete an entity without a UUID.');
      }

      return {
        url: "/jsonapi/".concat(this.entityType, "/").concat(this.entityBundle, "/").concat(this.entityUuid),
        method: 'DELETE',
        headers: _objectSpread({}, TypeHeaders)
      };
    }
    /**
     * Delete this entity.
     */

  }, {
    key: "delete",
    value: function _delete() {
      return _GlobalClient.default.send(this._toDeleteRequest());
    }
    /**
     * Create a copy of this entity.
     */

  }, {
    key: "copy",
    value: function copy() {
      var withUuid = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var copy = new Entity(this.entityType, this.entityBundle);
      copy._attributes = this._attributes;
      copy._relationships = this._relationships;
      copy._changes = this._changes;

      if (withUuid) {
        copy.entityUuid = this.entityUuid;
      }

      return copy;
    }
  }]);

  return Entity;
}();

exports.default = Entity;

_defineProperty(Entity, "Cache", {});