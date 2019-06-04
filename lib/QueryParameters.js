"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Array.prototype.flat() is not supported in IE.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
 */

/* eslint-disable */
if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth) {
    var flattend = [];

    (function flat(array, depth) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = array[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var el = _step.value;

          if (Array.isArray(el) && depth > 0) {
            flat(el, depth - 1);
          } else {
            flattend.push(el);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    })(this, Math.floor(depth) || 1);

    return flattend;
  };
}
/* eslint-enable */


var QueryParameters =
/*#__PURE__*/
function () {
  function QueryParameters(queryParameters) {
    _classCallCheck(this, QueryParameters);

    this.queryParameters = queryParameters;
  }

  _createClass(QueryParameters, [{
    key: "toString",
    value: function toString(depth) {
      return this.queryParameters.flat(depth).map(function (item) {
        return item.query ? item.query() : item;
      }).flat(depth).filter(function (item) {
        return item !== '';
      }).join('&');
    }
  }]);

  return QueryParameters;
}();

exports.default = QueryParameters;