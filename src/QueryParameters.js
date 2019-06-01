/* eslint-disable */
if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth) {
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

export default class QueryParameters {
  constructor(queryParameters) {
    this.queryParameters = queryParameters
  }

  toString(depth) {
    return this.queryParameters
      .flat(depth)
      .map(item => (item.query ? item.query() : item))
      .flat(depth)
      .filter(item => item !== '')
      .join('&')
  }
}
