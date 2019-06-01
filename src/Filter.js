/**
 * Based on: https://www.drupal.org/docs/8/modules/jsonapi/filtering
 */

export default class Filter {
  constructor({
    identifier,
    path,
    operator = '=',
    value,
    memberOf,
  }) {
    this.identifier = identifier
    this.path = path
    this.operator = operator
    this.value = value
    this.memberOf = memberOf
  }

  /* eslint-disable prefer-template */
  query() {
    return ([
      `filter[${this.identifier}][condition][path]=${this.path}`,
      (
        this.operator !== '='
          ? `filter[${this.identifier}][condition][operator]=${this.operator}`
          : ''
      ),
      (
        this.memberOf
          ? `filter[${this.identifier}][condition][memberOf]=${this.memberOf}`
          : ''
      ),
      (
        typeof this.value.map === 'function'
          ? this.value.map(singleValue => `filter[${this.identifier}][condition][value][]=${singleValue}`)
          : `filter[${this.identifier}][condition][value]=${this.value}`
      ),
    ])
  }
  /* eslint-enable prefer-template */
}
