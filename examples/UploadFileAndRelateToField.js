import { Client, Entity } from 'drupal-json-client'

const doRequest = async () => {
  const client = new Client({
    transport: fetch,
    baseUrl: 'https://www.example.com',
    sendCookies: true, // use this when running code on the same origin as Drupal
  })

  const entity = await client.getEntity('node', 'article', 'uuid')
  // Get file from HTML input
  const file = document.querySelector('input[type="file"]').files[0]
  const response = await client.send(entity.toUploadFileRequest('field_image', file))
  const json = await response.json()
  entity.setRelationship('field_image', Entity.FromResponse(json.data))
  return client.send(entity.toPatchRequest())
}
doRequest()
