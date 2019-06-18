[![CircleCI](https://circleci.com/gh/Auspicus/drupal-jsonapi-client/tree/master.svg?style=svg)](https://circleci.com/gh/Auspicus/drupal-jsonapi-client/tree/master)

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
- **Object oriented** - leverages ES6 classes to neatly package JSON:API objects
- **Familiar** - takes inspiration from Drupal's Entity API syntax

It's still in an early stage and contributions are welcome. The general idea is to maintain a base `Entity` class which can be extended to provide more context specific uses ie. `Article extends Entity`.

Here's some syntax sugar to sink your teeth into that illustrates the vision:

```js
import { GlobalClient, Entity } from 'drupal-json-client'

GlobalClient.transport = fetch
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

For more detailed usage, see the [examples](https://github.com/Auspicus/drupal-jsonapi-client/tree/3.x/examples).

## Node Support

- The library works in node.js with a polyfill for Request / Response objects.
- `regenerator-runtime` is also required because IE11 lacks support for async / await.

```js
require('regenerator-runtime/runtime');
const { GlobalClient } = require('drupal-jsonapi-client')
const { fetch, Request, Response } = require('node-fetch')
global.Request = Request
global.Response = Response
// you might also want to use node-fetch's fetch as the transport:
// GlobalClient.transport = fetch
```

## Browser Support

https://netmarketshare.com

- The library works in all major browsers without the need for polyfills
  - Chrome
  - Firefox
  - Safari
  - Edge

- IE11 doesn't support a few features that will require polyfills
  - Request and Response https://www.npmjs.com/package/whatwg-fetch
  - Proxy https://www.npmjs.com/package/proxy-polyfill
