# Drupal JSON:API Client

This package makes manipulating Drupal entities easier via the JSON:API module which is now in Drupal core (8.7.x).

It's still in an early stage and contributions are welcome. The general idea is to maintain a base `DrupalEntity` class which can be extended to provide more context specific uses ie. `Article extends DrupalEntity`.

Here's some syntax sugar to sink your teeth into:

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
