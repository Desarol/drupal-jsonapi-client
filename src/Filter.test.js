/* eslint-disable import/first */
require('regenerator-runtime/runtime') // eslint-disable-line

import { Request, Response } from 'node-fetch'
import Filter from './Filter'
import Client from './Client'

global.Request = Request
global.Response = Response

describe('Filter', () => {
  it('serializes simple filter to a query', () => {
    expect(Client._QueryParameterize([
      new Filter({
        identifier: 'filter-1',
        path: 'title',
        value: 'asdf123',
      }),
    ])).toMatchSnapshot()
  })

  it('serializes complex filter to query', () => {
    expect(Client._QueryParameterize([
      new Filter({
        identifier: 'filter-1',
        operator: 'IN',
        path: 'title',
        value: ['asdf', '1234'],
        memberOf: 'group-1',
      }),
    ])).toMatchSnapshot()
  })
})
