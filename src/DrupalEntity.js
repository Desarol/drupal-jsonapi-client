if (process.env.BABEL_ENV === 'test') {
  require('regenerator-runtime/runtime') // eslint-disable-line
  require('cross-fetch/polyfill') // eslint-disable-line
}

const TypeHeaders = {
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
}

export class MalformedEntity extends Error {}

export default class DrupalEntity {
  constructor(
    entityType,
    entityBundle,
    entityUuid,
    entityVersionId,
    requiredFieldsSerializationFields,
  ) {
    this.entityType = entityType
    this.entityBundle = entityBundle
    this.entityUuid = entityUuid || null

    this._entityId = null
    this._versionId = entityVersionId || null
    this._requiredFields = requiredFieldsSerializationFields || null
    this._attributes = {}
    this._relationships = {}
    this._changes = {
      attributes: {},
      relationships: {},
    }

    if (this._requiredFields) {
      this._requiredFields.forEach((field) => {
        if (field.field_type !== 'entity_reference') {
          this.editAttribute(field.field_name, '')
        } else {
          this.editRelationship(field.field_name, {
            data: {},
          })
        }
      })
    }
  }

  _serializeChanges() {
    const serialization = {
      data: {
        type: `${this.entityType}--${this.entityBundle}`,
        attributes: this._changes.attributes,
        relationships: this._changes.relationships,
      },
    }

    if (Object.keys(serialization.data.attributes).length === 0) {
      delete serialization.data.attributes
    }

    if (Object.keys(serialization.data.relationships).length === 0) {
      delete serialization.data.relationships
    }

    if (this.entityUuid) {
      serialization.data.id = this.entityUuid
    }

    return serialization
  }

  _serializeChangesForField(fieldName) {
    return { data: this.getChange(fieldName) }
  }

  _serialize() {
    const serialization = {
      data: {
        type: `${this.entityType}--${this.entityBundle}`,
        attributes: this._attributes,
        relationships: this._relationships,
      },
    }

    if (Object.keys(serialization.data.attributes).length === 0) {
      delete serialization.data.attributes
    }

    if (Object.keys(serialization.data.relationships).length === 0) {
      delete serialization.data.relationships
    }

    return serialization
  }

  nodeId() {
    return this._entityId
  }

  versionId() {
    return this._versionId
  }

  get(fieldName) {
    return this._attributes[fieldName] || this._relationships[fieldName]
  }

  getChange(fieldName) {
    return this._changes.attributes[fieldName] || this._changes.relationships[fieldName]
  }

  /**
   * Edit an attribute.
   *
   * @param {string} fieldName - Drupal machine name for the field
   * @param {any} fieldValue - value to send to JSON:API
   */
  editAttribute(fieldName, fieldValue) {
    this._attributes[fieldName] = fieldValue
    this._changes.attributes[fieldName] = fieldValue
  }

  /**
   * Edit a relationship.
   *
   * @param {string} fieldName - Drupal machine name for the field
   * @param {any} fieldValue - value to send to JSON:API
   */
  editRelationship(fieldName, fieldValue) {
    this._relationships[fieldName] = fieldValue
    this._changes.relationships[fieldName] = fieldValue
  }

  async uploadFile(baseUrl, fieldName, file) {
    const binary = await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = (event) => {
        resolve(event.target.result);
      };
      fr.readAsArrayBuffer(file);
    })

    return this.uploadBinary(baseUrl, fieldName, file.name, binary)
  }

  uploadBinary(baseUrl, fieldName, fileName, binary) {
    return new Request(`${baseUrl || ''}/jsonapi/${this.entityType}/${this.entityBundle}/${fieldName}`, {
      method: 'POST',
      headers: {
        ...TypeHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `file; filename="${fileName}"`,
      },
      body: binary,
    })
  }

  toPostRequest(baseUrl) {
    return new Request(`${baseUrl || ''}/jsonapi/${this.entityType}/${this.entityBundle}`, {
      method: 'POST',
      headers: { ...TypeHeaders },
      body: JSON.stringify(this._serialize()),
    })
  }

  toPatchRequest(baseUrl) {
    if (!this.entityUuid) {
      throw new MalformedEntity('Entity is missing UUID but was used in a PATCH request.')
    }

    return new Request(`${baseUrl || ''}/jsonapi/${this.entityType}/${this.entityBundle}/${this.entityUuid}`, {
      method: 'PATCH',
      headers: { ...TypeHeaders },
      body: JSON.stringify(this._serializeChanges()),
    })
  }

  toPatchRequestForRelationship(baseUrl, fieldName) {
    if (!this.entityUuid) {
      throw new MalformedEntity('Entity is missing UUID but was used in a PATCH request.')
    }

    return new Request(`${baseUrl}/jsonapi/${this.entityType}/${this.entityBundle}/${this.entityUuid}/relationships/${fieldName}`, {
      method: 'PATCH',
      headers: { ...TypeHeaders },
      body: JSON.stringify(this._serializeChangesForField(fieldName)),
    })
  }

  /**
   * Get required fields for this entity.
   *
   * @param {string} baseUrl
   */
  toFieldConfigRequest(baseUrl) {
    return new Request(`${
      baseUrl || ''
    }/jsonapi/field_config/field_config?filter[entity_type]=${
      this.entityType
    }&filter[bundle]=${
      this.entityBundle
    }`, {
      headers: { ...TypeHeaders },
    })
  }
}

export const DrupalEntityFromResponse = (jsonApiSerialization) => {
  const entityTypeParts = jsonApiSerialization.type.split('--')
  const entity = new DrupalEntity(
    entityTypeParts[0],
    entityTypeParts[1],
    jsonApiSerialization.attributes.drupal_internal__nid,
    jsonApiSerialization.attributes.drupal_internal__vid,
  )

  entity._attributes = jsonApiSerialization.attributes
  entity._relationships = (
    Object
      .keys(jsonApiSerialization.relationships)
      .map(key => ({ ...jsonApiSerialization.relationships[key].data, _$key: key }))
      .reduce((prev, curr) => {
        const key = curr._$key
        const copy = curr
        delete copy._$key
        return ({
          ...prev,
          [key]: copy,
        })
      }, {})
  )

  return entity
}

export const DrupalEntityFromSerializedRequiredFields = requiredFieldsSerialization => (
  new DrupalEntity(
    requiredFieldsSerialization.entity_type,
    requiredFieldsSerialization.entity_bundle,
    null,
    null,
    requiredFieldsSerialization.fields,
  )
)

export const AuthorizeRequest = (request, authorizationHeaderValue) => {
  const copy = request.clone()

  if (!authorizationHeaderValue) {
    return request
  }

  copy.headers.set('Authorization', authorizationHeaderValue)

  return copy
}
