/* eslint-disable import/first */
require('regenerator-runtime/runtime') // eslint-disable-line

import { Request, Response } from 'node-fetch'
import Client from './Client'
import Entity from './Entity'
import FilterGroup from './FilterGroup';
import Filter from './Filter';

global.Request = Request
global.Response = Response

describe('Client', () => {
  it('applies base URL', async () => {
    const BASE_URL = 'https://www.example.com'
    const PATH = '/jsonapi/node/article'
    const transportMock = jest.fn()

    const client = new Client({
      baseUrl: BASE_URL,
      transport: transportMock,
    })
    await client.send(new Request(PATH))
    expect(transportMock.mock.calls[0][0].url).toEqual(BASE_URL + PATH)
  })

  it('adds authorization headers', async () => {
    const AUTHORIZATION = `Basic ${'asdf=='}`

    const entity = new Entity('node', 'article')
    const transportMock = jest.fn()
    const client = new Client({
      baseUrl: '',
      transport: transportMock,
      authorization: AUTHORIZATION,
    })
    await client.send(entity.toPostRequest())
    expect(transportMock.mock.calls[0][0].headers.get('Authorization')).toEqual(AUTHORIZATION)
  })

  it('sends cookies', async () => {
    const XCSRFTOKEN = 'TEST_CSRF_TOKEN'

    const entity = new Entity('node', 'article')
    const transportMock = jest.fn(() => Promise.resolve(new Response(XCSRFTOKEN)))
    const client = new Client({
      baseUrl: '',
      transport: transportMock,
      sendCookies: true,
    })
    await client.send(entity.toPostRequest())
    expect(transportMock.mock.calls[1][0].headers.get('X-CSRF-Token')).toEqual(XCSRFTOKEN)
    expect(transportMock.mock.calls[1][0].credentials).toEqual('same-origin')
  })

  it('generates valid query string', () => {
    expect(Client._QueryParameterize(['page[offset]=0', 'page[limit]=50'])).toEqual('page[offset]=0&page[limit]=50')
  })

  it('generates valid query string from FilterGroup', () => {
    expect(
      Client._QueryParameterize(
        new FilterGroup({
          identifier: 'group-1',
          type: 'AND',
          children: [
            new Filter({
              identifier: 'filter-1',
              path: 'title',
              value: 'asdf',
            }),
          ],
        }).query(),
      ),
    ).toMatchSnapshot()
  })
})
