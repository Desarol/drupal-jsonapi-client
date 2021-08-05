import Filter from './Filter'
import Resource from './Resource'
import Sort from './Sort'

describe('Resource', () => {
  it('generates a valid request from a .Get call', () => {
    const request = Resource.Get({
      type: 'node--article',
      id: 'uuid-1234',
    })

    expect(request).toMatchSnapshot()
  })

  it('generates a valid request from a .GetList call', () => {
    const request = Resource.GetList({
      type: 'node--article',
    })

    expect(request).toMatchSnapshot()
  })

  it('generates valid filters from a .GetList call', () => {
    const request = Resource.GetList({
      type: 'node--article',
      filter: new Filter({
        identifier: '1',
        path: 'uid.name',
        value: 'foo',
      }),
    })

    expect(request).toMatchSnapshot()
  })

  it('generates valid filters and sort from a .GetList call', () => {
    const request = Resource.GetList({
      type: 'node--article',
      filter: new Filter({
        identifier: '1',
        path: 'uid.name',
        value: 'foo',
      }),
      sort: new Sort({
        identifier: 'sort-created',
        path: 'created',
      }),
    })

    expect(request).toMatchSnapshot()
  })

  it('generates a valid request from a .New call', () => {
    const request = Resource.New({
      type: 'node--article',
      data: {
        attributes: {
          title: 'title',
        },
      },
    })

    expect(request).toMatchSnapshot()
  })

  it('generates a valid request from a .Update call', () => {
    const request = Resource.Update({
      type: 'node--article',
      id: 'uuid-1234',
      data: {
        attributes: {
          title: 'title',
        },
      },
    })

    expect(request).toMatchSnapshot()
  })
})
