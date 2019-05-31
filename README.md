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

It's still in an early stage and contributions are welcome. The general idea is to maintain a base `Entity` class which can be extended to provide more context specific uses ie. `Article extends Entity`.

Here's some syntax sugar to sink your teeth into that illustrates the vision:

```js
import { Client } from 'drupal-json-client'

const doRequest = async () => {
  const client = new Client({
    transport: fetch, // or whatever HTTP library you are using
    baseUrl: 'https://www.example.com',
    sendCookies: true, // use this when running code on the same origin as Drupal
  })

  const entity = await client.getEntity('node', 'article', 'uuid')
  entity.setAttribute('title', 'Drupal JSON:API rocks!')
  return client.send(entity.toPatchRequest())
}
doRequest()
```

## Examples

For more detailed usage, see the [examples](https://github.com/Auspicus/drupal-jsonapi-client/tree/master/examples).