# Drupal JSON:API Client

This package makes manipulating Drupal entities and resources easier via the JSON:API module which is now in Drupal core (8.7.x).

## Installation
```
npm i --save drupal-jsonapi-client
```

```
yarn add drupal-jsonapi-client
```

## Key features
- **Lightweight** - HTTP library agnostic, zero dependencies
- **Cross platform** - works in node.js and the browser
- **Drupal specific** - abstracts away the nuances of working with Drupal's JSON:API implementation

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
