[![npm downloads](https://img.shields.io/npm/dt/drupal-jsonapi-client.svg?maxAge=2592000)](http://npmjs.com/package/drupal-jsonapi-client)
[![gzip size](https://img.badgesize.io/https://unpkg.com/drupal-jsonapi-client@3.1.0/lib/Browser.min.js)]()
[![version](https://img.shields.io/npm/v/drupal-jsonapi-client.svg)]()

# Drupal JSON:API Client

This package makes manipulating Drupal entities and resources easier via the JSON:API module which is now in Drupal core (8.7.x).

## Installation
```
npm i --save drupal-jsonapi-client
```

```
yarn add drupal-jsonapi-client
```

## Usage

ES6 module

```js
import { GlobalClient, Entity ... } from 'drupal-jsonapi-client'
```

UMD

```html
<script src="https://unpkg.com/drupal-jsonapi-client@3.0.5/lib/Browser.min.js"></script>
<script>
  const Entity = window.DrupalJsonApi.Entity
  
  Entity
  .Load('node', 'article', 'uuid')
  .then(entity => {
    console.log(entity)
  })
</script>
```

## Key features
- **Lightweight** - HTTP library agnostic, defaults to `axios` (3kb)
- **Cross platform** - works in node.js and the browser
- **Drupal specific** - abstracts away the nuances of working with Drupal's JSON:API implementation
- **Object oriented** - leverages ES6 classes to neatly package JSON:API objects
- **Familiar** - takes inspiration from Drupal's Entity API syntax

It's still in an early stage and contributions are welcome. The general idea is to maintain a base `Entity` class which can be extended to provide more context specific uses ie. `Article extends Entity`.

Here's some syntax sugar to sink your teeth into that illustrates the vision:

```js
import { GlobalClient, Entity } from 'drupal-jsonapi-client'

GlobalClient.baseUrl = 'https://www.example.com'
GlobalClient.sendCookies = true // use this when running code on the same origin as Drupal

const doRequest = async () => {
  // Update an existing entity
  const entity = await Entity.Load('node', 'article', 'uuid')
  entity.title = 'Drupal JSON:API rocks!'
  // PATCH the existing entity
  await entity.save()

  // Create a new entity
  const newEntity = new Entity('node', 'article')
  // .setAttribute must be used here as Entity
  // doesn't know whether title should be
  // an attribute or a relationship
  newEntity.setAttribute('title', 'A brand new article!')
  // Future references to "title" can use .title
  newEntity.title = 'We changed the title'
  // POST the new entity
  await newEntity.save()
}
doRequest()
```

## Examples

For more detailed usage, see the [examples](https://github.com/Desarol/drupal-jsonapi-client/tree/3.x/examples).

## Environment support

### Node.js

node.js >= 6.0.0

### Browsers

The library works in all modern browsers.

https://netmarketshare.com

## Sponsors

[![Desarol](https://user-images.githubusercontent.com/1893118/59728701-c6887e00-9200-11e9-9128-2589d87dca87.png)](https://www.desarol.com)
