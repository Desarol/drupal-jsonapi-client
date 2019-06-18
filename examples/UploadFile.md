# Upload a file

## Browser

You allow users to select files to upload.

```html
<input type="file" name="field_image" />
```

```js
import { File as FileEntity, GlobalClient } from 'drupal-jsonapi-client'

// ...configure GlobalClient
GlobalClient.baseUrl = 'https://www.example.com'
GlobalClient.transport = window.fetch.bind(window)

// Find the HTML input
const $input = document.querySelector('input[name="field_image"]')
// Get the first uploaded file (file inputs allow multiple files)
const file = $input.files[0]
// Setting fileName as null will use the HTML file's name
const fileName = null

// Let the client know where you want to upload this file
const entityType = 'node'
const entityBundle = 'article'
const fieldName = 'field_image'

// Upload the file to Drupal
const fileEntity = await FileEntity.Upload(
  file,
  fieldName,
  entityType,
  entityBundle,
  fieldName
)

// Use the file entity in further requests
const node = new Entity('node', 'article')
node.setAttribute('title', 'Hello world!')
node.setRelationship('field_image', fileEntity)

// Create a new Article
await node.save()
```

## Node.js