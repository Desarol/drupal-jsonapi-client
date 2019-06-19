import Client from './Client'
import Entity from './Entity'

describe('Client', () => {
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

  it('adds authorization headers', async () => {
    const AUTHORIZATION = `Basic ${'asdf=='}`

    const entity = new Entity('node', 'article')
    const transportMock = jest.fn(() => Promise.resolve({ data: {} }))
    const client = new Client({
      baseUrl: '',
      transport: transportMock,
      authorization: AUTHORIZATION,
    })
    await client.send(entity._toPostRequest())
    expect(transportMock.mock.calls[0][0].headers.Authorization).toEqual(AUTHORIZATION)
  })

  it('sends cookies', async () => {
    const XCSRFTOKEN = 'TEST_CSRF_TOKEN'

    const entity = new Entity('node', 'article')
    const transportMock = jest.fn(() => Promise.resolve({ data: XCSRFTOKEN }))
    const client = new Client({
      baseUrl: '',
      transport: transportMock,
      sendCookies: true,
    })
    await client.send(entity._toPostRequest())
    expect(transportMock.mock.calls[1][0].headers['X-CSRF-Token']).toEqual(XCSRFTOKEN)
    expect(transportMock.mock.calls[1][0].withCredentials).toEqual(true)
  })
})
