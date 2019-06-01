/* eslint-disable import/first */
require('regenerator-runtime/runtime') // eslint-disable-line

import { Request, Response } from 'node-fetch'
import Filter from './Filter'
import Client from './Client'
import QueryParameters from './QueryParameters';

global.Request = Request
global.Response = Response

describe('Filter', () => {
  it('serializes simple filter to a query', () => {
    expect((new QueryParameters([
      new Filter({
        identifier: 'filter-1',
        path: 'title',
        value: 'asdf123',
      }),
    ])).toString(10)).toMatchSnapshot()
  })

  it('serializes complex filter to query', () => {
    expect((new QueryParameters([
      new Filter({
        identifier: 'filter-1',
        operator: 'IN',
        path: 'title',
        value: ['asdf', '1234'],
        memberOf: 'group-1',
      }),
    ])).toString(10)).toMatchSnapshot()
  })
})
