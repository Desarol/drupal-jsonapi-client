import { Client, Entity } from 'drupal-json-client'

const doRequest = () => {
  const client = new Client({
    transport: fetch,
    baseUrl: 'https://www.example.com',
    sendCookies: true, // use this when running code on the same origin as Drupal
  })

  const entity = new Entity('node', 'article')
  entity.setAttribute('title', 'Drupal JSON:API rocks!')
  return client.send(entity.toPostRequest())
}
doRequest()
