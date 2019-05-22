# Drupal JSON:API Client

This package makes manipulating Drupal entities easier via the JSON:API module which is now in Drupal core (8.7.x).

It's still in an early stage and contributions are welcome. The general idea is to maintain a base `DrupalEntity` class which can be extended to provide more context specific uses ie. `Article extends DrupalEntity`.

Here's some syntax sugar to sink your teeth into:

```js
import { DrupalEntity } from 'drupal-jsonapi-client/lib/DrupalEntity'

const editTitle = async () => {

  // Create a local representation of a Drupal entity
  const entity = new DrupalEntity('node', 'article', 'ENTITY_UUID')
  
  // This will get the data for this entity from Drupal
  await FetchDrupalEntity(entity)

  // You can now edit the fields
  entity.editAttribute('title', 'Hello world!');

  // And send the updated fields back to Drupal for saving
  const response = await fetch(entity.toPatchRequest())
  const json = await response.json()
  const updatedEntity = DrupalEntityFromResponse(json.data)
  
}
editTitle()
```
