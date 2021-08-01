"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Array.prototype.flat() is not supported in IE.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
 */

/* eslint-disable */
if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth) {
    var flattend = [];

    (function flat(array, depth) {
      for (let el of array) {
        if (Array.isArray(el) && depth > 0) {
          flat(el, depth - 1);
        } else {
          flattend.push(el);
        }
      }
    })(this, Math.floor(depth) || 1);

    return flattend;
  };
}
/* eslint-enable */


class QueryParameters {
  constructor(queryParameters) {
    this.queryParameters = queryParameters;
  }

  toString(depth) {
    return this.queryParameters.flat(depth).map(item => !!item && item.query ? item.query() : item).flat(depth).filter(item => !!item).join('&');
  }

}

exports.default = QueryParameters;