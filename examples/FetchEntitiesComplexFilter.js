import { Client, FilterGroup, Filter } from 'drupal-json-client'

const doRequest = async () => {
  const client = new Client({
    transport: fetch,
    baseUrl: 'https://www.example.com',
    sendCookies: true, // use this when running code on the same origin as Drupal
  })

  const entities = await client.getEntities({
    entityType: 'node',
    entityBundle: 'article',
    filter: new FilterGroup({
      identifier: 'group-1',
      type: 'OR',
      children: [
        new Filter({
          identifier: 'filter-1',
          path: 'title',
          value: 'asdf',
        }),
        new Filter({
          identifier: 'filter-2',
          path: 'status',
          value: 1,
        }),
      ],
    }),
    pageOffset: 0,
    pageLimit: 50,
  })
  entities[0].setAttribute('title', 'Drupal JSON:API rocks!')
  return client.send(entities[0].toPatchRequest())
}
doRequest()
