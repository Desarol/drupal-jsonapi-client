# Get Entity authored by User

```js
const fetchEntityAuthoredByUser = async () => {
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
  const pageLimit = 50 // jsonapi doesn't let you fetch more than 50 at a time

  const entities = await Entity.LoadMultiple(
    entityType,
    entityBundle,
    filter,
    include,
    pageOffset,
    pageLimit,
  );
}
```
