import OpenApi from './OpenApi'

describe('OpenApi', () => {
  it('fetches EntityStorage definitions', async () => {
    expect(await OpenApi.FetchEntityDefinitions('http://example.pantheonsite.io/openapi/jsonapi')).toMatchSnapshot()
  })
})
