// eslint-disable-next-line import/no-unresolved
import { DrupalEntity, AuthorizeRequest } from 'drupal-jsonapi-client' // const DrupalEntity = require('drupal-jsonapi-client').default

// Create a new DrupalEntity representation
const entity = new DrupalEntity('node', 'article', 'uuid-of-this-entity')

// Edit attributes and relationships
entity.editAttribute('body', {
  value: 'Drupal rocks',
})
entity.editRelationship('field_reference', {
  id: 'another-uuid-of-another-entity',
})

// Send the update request
const doRequest = async () => {
  const response = await fetch(
    AuthorizeRequest(
      entity.toPatchRequest('https://www.example.com'),
      `Basic ${btoa('username:password')}`,
    ),
  )
  const json = await response.json()
  console.log(json) // eslint-disable-line
}
doRequest()
