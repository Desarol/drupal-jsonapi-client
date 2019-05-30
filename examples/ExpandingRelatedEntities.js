import { Client } from 'drupal-json-client'

const doRequest = async () => {
  const client = new Client({
    transport: fetch,
    baseUrl: 'https://www.example.com',
    sendCookies: true, // use this when running code on the same origin as Drupal
  })

  const entity = await client.getEntity('node', 'article', 'uuid')

  // This will fetch the entity referenced via this field.
  // This response is cached so subsequent calls to expand
  // the same entity (keyed by UUID) won't use the network.
  const relatedEntity = await entity.expand('field_relationship', client)

  // You now have access to this entity and all it's attributes and relationships.
  console.log(relatedEntity.get('title'))

  // You can even update it.
  relatedEntity.setAttribute('title', 'New Title!')

  // We don't currently support updating the entity referring to this.
  return client.send(relatedEntity.toPatchRequest())
}
doRequest()
