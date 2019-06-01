"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Based on: https://www.drupal.org/docs/8/modules/jsonapi/filtering
 */
var Filter =
/*#__PURE__*/
function () {
  function Filter(_ref) {
    var identifier = _ref.identifier,
        path = _ref.path,
        _ref$operator = _ref.operator,
        operator = _ref$operator === void 0 ? '=' : _ref$operator,
        value = _ref.value,
        memberOf = _ref.memberOf;

    _classCallCheck(this, Filter);

    this.identifier = identifier;
    this.path = path;
    this.operator = operator;
    this.value = value;
    this.memberOf = memberOf;
  }
  /* eslint-disable prefer-template */


  _createClass(Filter, [{
    key: "query",
    value: function query() {
      var _this = this;

      return ["filter[".concat(this.identifier, "][condition][path]=").concat(this.path), this.operator !== '=' ? "filter[".concat(this.identifier, "][condition][operator]=").concat(this.operator) : '', this.memberOf ? "filter[".concat(this.identifier, "][condition][memberOf]=").concat(this.memberOf) : '', typeof this.value.map === 'function' ? this.value.map(function (singleValue) {
        return "filter[".concat(_this.identifier, "][condition][value]=").concat(singleValue);
      }) : "filter[".concat(this.identifier, "][condition][value]=").concat(this.value)];
    }
    /* eslint-enable prefer-template */

  }]);

  return Filter;
}();

exports.default = Filter;