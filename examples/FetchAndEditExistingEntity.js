import { Client } from 'drupal-json-client'

const doRequest = async () => {
  const client = new Client({
    transport: fetch,
    baseUrl: 'https://www.example.com',
    sendCookies: true, // use this when running code on the same origin as Drupal
  })

  const entity = await client.getEntity('node', 'article', 'uuid')
  entity.setAttribute('title', 'Drupal JSON:API rocks!')
  return client.send(entity.toPatchRequest())
}
doRequest()
