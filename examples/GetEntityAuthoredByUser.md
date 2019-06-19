# Get Entity authored by User

```js
const userUuid = '1234-asdf-1234-asdf';
const entityType = 'node'
const entityBundle = 'article'
const filter = new Filter({
  identifier: 'user-id',
  path: 'uid.id',
  value: userUuid
})
const include = [] // if you want to fetch related entities
const pageOffset = 0
const pageLimit = 50

const entities = Entity.LoadMultiple(
  entityType,
  entityBundle,
  filter,
  include = [],
  pageOffset = 0,
  pageLimit = 50,
);
```
