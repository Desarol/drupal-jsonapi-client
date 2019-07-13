/* eslint-disable import/first */
require('regenerator-runtime/runtime') // eslint-disable-line

import QueryParameters from './QueryParameters'
import FilterGroup from './FilterGroup'
import Filter from './Filter'

describe('QueryParameters', () => {
  it('generates valid query string', () => {
    expect((new QueryParameters(['page[offset]=0', 'page[limit]=50'])).toString()).toEqual('page[offset]=0&page[limit]=50')
  })

  it('generates valid query string from FilterGroup', () => {
    expect((new QueryParameters([
      new FilterGroup({
        identifier: 'group-1',
        type: 'AND',
        children: [
          new Filter({
            identifier: 'filter-1',
            path: 'title',
            value: 'asdf',
          }),
        ],
      }),
    ])).toString()).toMatchSnapshot()
  })
})
