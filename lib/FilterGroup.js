"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Based on: https://www.drupal.org/docs/8/modules/jsonapi/filtering
 */
var FilterGroup =
/*#__PURE__*/
function () {
  function FilterGroup(_ref) {
    var _this = this;

    var identifier = _ref.identifier,
        type = _ref.type,
        memberOf = _ref.memberOf,
        children = _ref.children;

    _classCallCheck(this, FilterGroup);

    this.identifier = identifier;
    this.type = type;
    this.memberOf = memberOf;
    this.children = children.map(function (child) {
      // eslint-disable-next-line no-param-reassign
      child.memberOf = _this.identifier;
      return child;
    });
  }
  /* eslint-disable prefer-template */


  _createClass(FilterGroup, [{
    key: "query",
    value: function query() {
      return ["filter[".concat(this.identifier, "][group][conjunction]=").concat(this.type), this.memberOf ? "filter[".concat(this.identifier, "][group][memberOf]=").concat(this.memberOf) : ''].concat(_toConsumableArray(this.children.map(function (child) {
        return child.query();
      })));
    }
    /* eslint-enable prefer-template */

  }]);

  return FilterGroup;
}();

exports.default = FilterGroup;