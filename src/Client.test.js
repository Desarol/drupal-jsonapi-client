import axios from 'axios'
import Client from './Client'
import GlobalClient from './GlobalClient'

describe('Client', () => {
  afterEach(() => {
    GlobalClient.baseUrl = ''
    GlobalClient.transport = null
    GlobalClient.authorization = null
    GlobalClient.sendCookies = false
  })

  it('applies base URL', async () => {
    const BASE_URL = 'https://www.example.com'
    const PATH = '/jsonapi/node/article'
    const transportMock = jest.fn(() => Promise.resolve({ data: {} }))

    const client = new Client({
      baseUrl: BASE_URL,
      transport: transportMock,
    })
    await client.send({
      url: PATH,
      method: 'GET',
    })
    expect(transportMock.mock.calls[0][0].url).toEqual(PATH)
  })

  it('adds EntityStorage definitions to EntityTypeManager', async () => {
    const client = new Client({
      transport: axios.request,
    })
    await client.initEntityTypeManager('http://example.pantheonsite.io/openapi/jsonapi')
    expect(client.entityTypeManager).toMatchSnapshot()
  })

  // it('adds authorization headers', async () => {
  //   const AUTHORIZATION = 'Basic asdf=='

  //   const entity = new Entity('node', 'article')
  //   const transportMock = jest.fn(() => Promise.resolve({ data: {} }))
  //   GlobalClient.baseUrl = ''
  //   GlobalClient.transport = transportMock
  //   GlobalClient.authorization = AUTHORIZATION
  //   await entity.save()
  //   expect(transportMock.mock.calls[0][0].headers.Authorization).toEqual(AUTHORIZATION)
  // })

  // it('sends cookies', async () => {
  //   const XCSRFTOKEN = 'TEST_CSRF_TOKEN'

  //   const entity = new Entity('node', 'article')
  //   const transportMock = jest.fn(() => Promise.resolve({ data: XCSRFTOKEN }))
  //   GlobalClient.baseUrl = ''
  //   GlobalClient.transport = transportMock
  //   GlobalClient.sendCookies = true
  //   await entity.save()
  //   expect(transportMock.mock.calls[1][0].headers['X-CSRF-Token']).toEqual(XCSRFTOKEN)
  //   expect(transportMock.mock.calls[1][0].withCredentials).toEqual(true)
  // })
})
