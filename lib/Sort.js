"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SortDirection = void 0;

/**
 * Based on: https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/sorting
 */
const SortDirection = {
  DESCENDING: 'DESC',
  ASCENDING: 'ASC'
};
exports.SortDirection = SortDirection;

class Sort {
  constructor({
    identifier,
    path,
    direction = SortDirection.ASCENDING
  }) {
    this.identifier = identifier;
    this.path = path;
    this.direction = direction;
  }
  /* eslint-disable prefer-template */


  query() {
    return [`sort[${this.identifier}][path]=${this.path}`, this.direction === SortDirection.DESCENDING ? `sort[${this.identifier}][direction]=${this.direction}` : ''];
  }
  /* eslint-enable prefer-template */


}

exports.default = Sort;