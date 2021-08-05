```js
// Get a resource by type, bundle and ID
Resource.Get({
  type: 'node--article',
  id: 'uuid-1234',
  include: '', // optional.
})

// Get page of resources of a specific type, applying filters and query parameters
Resource.GetList({
  type: 'node--article',
  filters: null,
  include: '',
  offset: 0,
  limit: 50,
})
```
