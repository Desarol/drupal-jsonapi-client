/* eslint-disable import/first */
require('regenerator-runtime/runtime') // eslint-disable-line

import QueryParameters from './QueryParameters'
import FilterGroup from './FilterGroup'
import Filter from './Filter'

describe('Filter', () => {
  it('serializes filter group with conjunction AND to a query', () => {
    expect((new QueryParameters([
      new FilterGroup({
        identifier: 'group-1',
        type: 'AND',
        children: [
          new Filter({
            identifier: 'filter-1',
            path: 'title',
            value: 'asdf123',
          }),
          new Filter({
            identifier: 'filter-2',
            path: 'status',
            value: 1,
          }),
        ],
      }),
    ])).toString(10)).toMatchSnapshot()
  })

  it('serializes filter group with conjunction OR to a query', () => {
    expect((new QueryParameters([
      new FilterGroup({
        identifier: 'group-1',
        type: 'OR',
        children: [
          new Filter({
            identifier: 'filter-1',
            path: 'title',
            value: 'asdf123',
          }),
          new Filter({
            identifier: 'filter-2',
            path: 'status',
            value: 1,
          }),
        ],
      }),
    ])).toString(10)).toMatchSnapshot()
  })

  it('serializes nested filter groups', () => {
    expect((new QueryParameters([
      new FilterGroup({
        identifier: 'group-3',
        type: 'OR',
        children: [
          new FilterGroup({
            identifier: 'group-1',
            type: 'AND',
            children: [
              new Filter({
                identifier: 'filter-1',
                path: 'title',
                value: 'asdf123',
              }),
              new Filter({
                identifier: 'filter-2',
                path: 'status',
                value: 1,
              }),
            ],
          }),
          new FilterGroup({
            identifier: 'group-2',
            type: 'AND',
            children: [
              new Filter({
                identifier: 'filter-3',
                path: 'title',
                value: 'asdf123',
              }),
              new Filter({
                identifier: 'filter-4',
                path: 'status',
                value: 1,
              }),
            ],
          }),
        ],
      }),
    ])).toString(10)).toMatchSnapshot()
  })
})
