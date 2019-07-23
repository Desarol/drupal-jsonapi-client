/**
 * Based on: https://www.drupal.org/docs/8/modules/jsonapi/filtering
 */

export default class FilterGroup {
  constructor({
    identifier,
    type,
    memberOf,
    children,
  }) {
    this.identifier = identifier
    this.type = type
    this.memberOf = memberOf
    this.children = children.map((child) => {
      // eslint-disable-next-line no-param-reassign
      child.memberOf = this.identifier
      return child
    })
  }

  /* eslint-disable prefer-template */
  query() {
    return ([
      `filter[${this.identifier}][group][conjunction]=${this.type}`,
      (this.memberOf ? `filter[${this.identifier}][group][memberOf]=${this.memberOf}` : ''),
      ...this.children.map(child => child.query()),
    ])
  }
  /* eslint-enable prefer-template */
}
