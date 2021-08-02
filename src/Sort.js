/**
 * Based on: https://www.drupal.org/docs/core-modules-and-themes/core-modules/jsonapi-module/sorting
 */

export const SortDirection = {
  DESCENDING: 'DESC',
  ASCENDING: 'ASC',
}

export default class Sort {
  constructor({
    identifier,
    path,
    direction = SortDirection.ASCENDING,
  }) {
    this.identifier = identifier
    this.path = path
    this.direction = direction
  }

  /* eslint-disable prefer-template */
  query() {
    return ([
      `sort[${this.identifier}][path]=${this.path}`,
      this.direction === SortDirection.DESCENDING ? `sort[${this.identifier}][direction]=${this.direction}` : '',
    ])
  }
  /* eslint-enable prefer-template */
}
