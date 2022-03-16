import Filter from './Filter'
import QueryParameters from './QueryParameters';

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
