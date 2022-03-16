import QueryParameters from './QueryParameters'
import Sort from './Sort'

describe('Filter', () => {
  it('serializes sort to query', () => {
    expect((new QueryParameters([
      new Sort({
        identifier: 'sort-created',
        path: 'created',
      }),
    ])).toString(10)).toMatchSnapshot()
  })
})
