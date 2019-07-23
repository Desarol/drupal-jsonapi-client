import axios from 'axios'

import OpenApiError from '../Error/OpenApiError'
import EntityStorage from '../Entity/EntityStorage';

class OpenApi {
  static async FetchEntityDefinitions(openApiUrl) {
    let response
    try {
      response = await axios.get(openApiUrl)
    } catch (err) {
      throw new OpenApiError(`Failed to fetch OpenAPI definitions: ${err.message}`)
    }

    if (response.data) {
      return Object
        .keys(response.data.definitions)
        .map((key) => {
          const machineName = key
          const definition = response.data.definitions[machineName]
          const { attributes, relationships } = definition.properties.data.properties
          const properties = {
            attributes: Object.keys(attributes.properties)
              .map(attributesKey => ({
                key: attributesKey,
                value: attributes.properties[attributesKey],
              }))
              .reduce((prev, curr) => {
                let defaultValue
                // eslint-disable-next-line default-case
                switch (curr.value.type) {
                  case 'boolean':
                    defaultValue = false
                    break
                  case 'string':
                    defaultValue = ''
                    break
                  case 'float':
                  case 'integer':
                  case 'number':
                    defaultValue = 0
                    break
                  case 'object':
                    defaultValue = {}
                    break
                  case 'array':
                    defaultValue = []
                    break
                }
                // eslint-disable-next-line no-param-reassign
                prev[curr.key] = {
                  type: curr.value.type,
                  title: curr.value.title,
                  description: curr.value.description,
                  properties: curr.value.properties,
                  defaultValue: curr.value.default || defaultValue,
                }
                return prev
              }, {}),
            relationships: Object.keys(relationships.properties)
              .map((relationshipKey) => {
                const relationship = relationships.properties[relationshipKey]
                const relationshipType = relationship.properties.data.type
                let relationshipModel

                if (relationshipType === 'array') {
                  relationshipModel = relationship.properties.data.items.properties.type.enum
                } else {
                  relationshipModel = relationship.properties.data.properties.type.enum
                }

                if (relationshipModel) {
                  return {
                    key: relationshipKey,
                    value: relationshipModel,
                  }
                }

                return null
              })
              .filter(item => !!item)
              .reduce((prev, curr) => {
                // eslint-disable-next-line no-param-reassign
                prev[curr.key] = curr.value
                return prev
              }, {}),
          }

          const computedAttributes = [
            'drupal_internal__id',
            'drupal_internal__uid',
            'drupal_internal__nid',
            'drupal_internal__vid',
            'drupal_internal__tid',
            'drupal_internal__revision_id',
            'revision_translation_affected',
            'path',
          ]

          return new EntityStorage(machineName, properties, {
            attributes: (attributes.required || [])
              .filter(attr => computedAttributes.indexOf(attr) === -1),
            relationships: relationships.required || [],
          })
        })
    }

    throw new OpenApiError('Response from OpenAPI did not contain a body')
  }
}

export default OpenApi
