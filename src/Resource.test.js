import Filter from './Filter'
import Resource from './Resource'

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

  it('generates a valid filters from a .GetList call', () => {
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

  it('generates a valid request from a .New call', () => {
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
})
