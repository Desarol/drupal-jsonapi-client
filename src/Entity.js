import MalformedEntity from './Error/MalformedEntity'

const TypeHeaders = {
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
}

export default class Entity {
  static FromResponse(response) {
    const entity = new Entity()
    entity._applySerializedData(response)
    return entity
  }

  static FromRequiredFields(requiredFieldsSerialization) {
    const entity = new Entity(
      requiredFieldsSerialization.entity_type,
      requiredFieldsSerialization.entity_bundle,
      null,
      null,
      requiredFieldsSerialization.fields,
    )
    return entity
  }

  constructor(
    entityType,
    entityBundle,
    entityUuid,
    entityVersionId,
    requiredFields,
  ) {
    this.entityType = entityType
    this.entityBundle = entityBundle
    this.entityUuid = entityUuid || null

    this._entityId = null
    this._versionId = entityVersionId || null
    this._requiredFields = requiredFields || null
    this._attributes = {}
    this._relationships = {}
    this._changes = {
      attributes: {},
      relationships: {},
    }

    if (this._requiredFields) {
      this._requiredFields.forEach((field) => {
        if (field.field_type !== 'entity_reference') {
          this._attributes[field.field_name] = ''
        } else {
          this._relationships[field.field_name] = {
            data: {},
          }
        }
      })
    }
  }

  _applySerializedData(jsonApiSerialization) {
    const [entityType, entityBundle] = jsonApiSerialization.type.split('--')
    this.entityType = entityType
    this.entityBundle = entityBundle
    this.entityUuid = jsonApiSerialization.id
    this._entityId = jsonApiSerialization.attributes.drupal_internal__nid
    this._versionId = jsonApiSerialization.attributes.drupal_internal__vid
    this._attributes = jsonApiSerialization.attributes
    this._relationships = Object
      .keys(jsonApiSerialization.relationships)
      .map(key => ({ data: jsonApiSerialization.relationships[key].data, _$key: key }))
      .reduce((prev, curr) => {
        const key = curr._$key
        const copy = curr
        delete copy._$key
        return ({
          ...prev,
          [key]: copy,
        })
      }, {})
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

  entityId() {
    return this._entityId
  }

  versionId() {
    return this._versionId
  }

  /**
   * Get field value.
   *
   * @param {string} fieldName
   */
  get(fieldName) {
    return this._attributes[fieldName] !== undefined
      ? this._attributes[fieldName]
      : this._relationships[fieldName]
  }

  /**
   * Get local changes for this entity.
   *
   * @param {string} fieldName
   */
  getChange(fieldName) {
    return this._changes.attributes[fieldName] !== undefined
      ? this._changes.attributes[fieldName]
      : this._changes.relationships[fieldName]
  }

  /**
   * Get an expanded representation of a related entity.
   *
   * @param {string} fieldName
   * @param {Client} client - client to use when expanding related entity
   */
  async expand(fieldName, client) {
    if (!this._relationships[fieldName]) {
      throw new MalformedEntity(`Failed to find related entity from field ${fieldName}`)
    }

    if (
      this._relationships[fieldName].data
      && this._relationships[fieldName].data.type
      && typeof this._relationships[fieldName].data.type === 'string'
      && this._relationships[fieldName].data.id
    ) {
      const [entityType, entityBundle] = this._relationships[fieldName].data.type.split('--')
      return client.getEntity(entityType, entityBundle, this._relationships[fieldName].data.id)
    }

    throw new MalformedEntity(`Related field ${fieldName} doesn't have sufficient information to expand.`)
  }

  /**
   * Set an attribute.
   *
   * @param {string} fieldName - Drupal machine name for the field
   * @param {any} fieldValue - value to send to JSON:API
   */
  setAttribute(fieldName, fieldValue) {
    this._attributes[fieldName] = fieldValue
    this._changes.attributes[fieldName] = fieldValue
  }

  /**
   * Set a relationship.
   *
   * @param {string} fieldName - Drupal machine name for the field
   * @param {any} fieldValue - value to send to JSON:API
   */
  setRelationship(fieldName, fieldValue) {
    this._relationships[fieldName] = fieldValue
    this._changes.relationships[fieldName] = fieldValue
  }

  /**
   * Take a File and upload it to Drupal.
   *
   * @param {string} fieldName
   * @param {File} file
   */
  async toUploadFileRequest(fieldName, file) {
    const binary = await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = (event) => {
        resolve(event.target.result);
      };
      fr.readAsArrayBuffer(file);
    })

    return this.toUploadBinaryRequest(fieldName, file.name, binary)
  }

  toUploadBinaryRequest(fieldName, fileName, binary) {
    return new Request(`/jsonapi/${this.entityType}/${this.entityBundle}/${fieldName}`, {
      method: 'POST',
      headers: {
        ...TypeHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `file; filename="${fileName}"`,
      },
      body: binary,
    })
  }

  toPostRequest() {
    return new Request(`/jsonapi/${this.entityType}/${this.entityBundle}`, {
      method: 'POST',
      headers: { ...TypeHeaders },
      body: JSON.stringify(this._serialize()),
    })
  }

  toPatchRequest() {
    if (!this.entityUuid) {
      throw new MalformedEntity('Entity is missing UUID but was used in a PATCH request.')
    }

    return new Request(`/jsonapi/${this.entityType}/${this.entityBundle}/${this.entityUuid}`, {
      method: 'PATCH',
      headers: { ...TypeHeaders },
      body: JSON.stringify(this._serializeChanges()),
    })
  }

  toPatchRequestForRelationship(fieldName) {
    if (!this.entityUuid) {
      throw new MalformedEntity('Entity is missing UUID but was used in a PATCH request.')
    }

    return new Request(`/jsonapi/${this.entityType}/${this.entityBundle}/${this.entityUuid}/relationships/${fieldName}`, {
      method: 'PATCH',
      headers: { ...TypeHeaders },
      body: JSON.stringify(this._serializeChangesForField(fieldName)),
    })
  }

  /**
   * Get required fields for this entity.
   */
  toFieldConfigRequest() {
    return new Request(`/jsonapi/field_config/field_config?filter[entity_type]=${
      this.entityType
    }&filter[bundle]=${
      this.entityBundle
    }`, {
      headers: { ...TypeHeaders },
    })
  }
}
