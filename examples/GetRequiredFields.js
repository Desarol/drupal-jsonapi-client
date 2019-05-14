const fs = require('fs')
const path = require('path')
// eslint-disable-next-line import/no-unresolved
const { DrupalEntity, AuthorizeRequest, RequiredFieldsFromFieldConfigResponse } = require('../lib/index').default // const DrupalEntity = require('drupal-jsonapi-client').default

// Some helpers
const writeFile = (filePath, contents) => (
  new Promise((resolve, reject) => {
    fs.writeFile(filePath, contents, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
)
const btoa = string => Buffer.from(string, 'binary').toString('base64')

// Create a new DrupalEntity representation
const entity = new DrupalEntity('node', 'article')

// This is not required, it just helps you formulate a
// DrupalEntity when creating entities from scratch.
// Fetch the required fields.
// This only need to be done once and can be saved as a JSON file.
const fetchRequiredFields = async () => {
  const response = await fetch(
    AuthorizeRequest(
      entity.toFieldConfigRequest('https://www.example.com'),
      `Basic ${btoa('username:password')}`,
    ),
  )
  const json = await response.json()
  await writeFile(path.join(__dirname, 'required_fields.json'), JSON.stringify(
    RequiredFieldsFromFieldConfigResponse(json).serialize(),
  ))
}
fetchRequiredFields()
