"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Based on: https://www.drupal.org/docs/8/modules/jsonapi/filtering
 */
class FilterGroup {
  constructor(_ref) {
    let {
      identifier,
      type,
      memberOf,
      children
    } = _ref;
    this.identifier = identifier;
    this.type = type;
    this.memberOf = memberOf;
    this.children = children.map(child => {
      // eslint-disable-next-line no-param-reassign
      child.memberOf = this.identifier;
      return child;
    });
  }
  /* eslint-disable prefer-template */


  query() {
    return [`filter[${this.identifier}][group][conjunction]=${this.type}`, this.memberOf ? `filter[${this.identifier}][group][memberOf]=${this.memberOf}` : '', ...this.children.map(child => child.query())];
  }
  /* eslint-enable prefer-template */


}

exports.default = FilterGroup;