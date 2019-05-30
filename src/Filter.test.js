/* eslint-disable import/first */
require('regenerator-runtime/runtime') // eslint-disable-line

import { Request, Response } from 'node-fetch'
import Filter from './Filter'

global.Request = Request
global.Response = Response

describe('Filter', () => {
  it('serializes simple filter to a query', () => {
    expect(new Filter({
      identifier: 'filter-1',
      path: 'title',
      value: 'asdf123',
    }).query()).toMatchSnapshot()
  })

  it('serializes complex filter to query', () => {
    expect(new Filter({
      identifier: 'filter-1',
      operator: 'IN',
      path: 'title',
      value: ['asdf', '1234'],
      memberOf: 'group-1',
    }).query()).toMatchSnapshot()
  })
})
