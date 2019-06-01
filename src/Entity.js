import EntityNotFound from './Error/EntityNotFound'
import MalformedEntity from './Error/MalformedEntity'
import GlobalClient from './GlobalClient'
import QueryParameters from './QueryParameters'

const TypeHeaders = {
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
}

export const EntityCache = {}

export default class Entity {
  static FromResponse(response) {
    const entity = new Entity()
    entity._applySerializedData(response)
    return entity
  }

  /**
   * Get a single entity.
   *
   * @param {string} entityType
   * @param {string} entityBundle
   * @param {string} entityUuid
   * @param {boolean} refreshCache
   */
  static async Load(entityType, entityBundle, entityUuid, refreshCache = false) {
    if (EntityCache[entityUuid] && refreshCache === false) {
      return Entity.FromResponse(EntityCache[entityUuid])
    }

    const response = await this.send(new Request(`/jsonapi/${entityType}/${entityBundle}/${entityUuid}`))
    const json = await response.json()
    if (json && json.data) {
      const entity = Entity.FromResponse(json.data)
      EntityCache[entityUuid] = entity._serialize()
      return entity
    }

    throw new EntityNotFound(`Failed to find entity matching entity type ${entityType}, entity bundle ${entityBundle} and uuid ${entityUuid}`)
  }

  /**
   * Get entities matching provided filters.
   *
   * @param {object}              config
   *
   * @param {string}              config.entityType
   * @param {string}              config.entityBundle
   * @param {Filter|FilterGroup}  config.filter               default = {}
   * @param {number}              config.pageOffset           default = 0
   * @param {number}              config.pageLimit            default = 50
   */
  static async LoadMultiple({
    entityType,
    entityBundle,
    filter = {},
    pageOffset = 0,
    pageLimit = 50,
  }) {
    const filterQuery = typeof filter.query === 'function' ? filter.query() : filter
    const queryParameters = new QueryParameters([filterQuery, `page[offset]=${pageOffset}`, `page[limit]=${pageLimit}`])

    const response = await this.send(new Request(`/jsonapi/${entityType}/${entityBundle}?${queryParameters.toString(Number.MAX_SAFE_INTEGER)}`))
    const json = await response.json()

    if (json && json.data && json.data.length && json.data.length > 0) {
      return json.data.map((item) => {
        const entity = new Entity()
        entity._applySerializedData(item)
        return entity
      })
    }
    return json.data
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

    this._enforceNew = false
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
   */
  async expand(fieldName) {
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
      return Entity.Load(entityType, entityBundle, this._relationships[fieldName].data.id)
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
    let value = fieldValue
    if (fieldValue instanceof Entity) {
      value = {
        data: {
          type: `${fieldValue.entityType}--${fieldValue.entityBundle}`,
          id: fieldValue.entityUuid,
        },
      }
    }

    this._relationships[fieldName] = value
    this._changes.relationships[fieldName] = value
  }

  /**
   * Take a File and upload it to Drupal.
   *
   * @param {string} fieldName
   * @param {File} file
   */
  async _toUploadFileRequest(fieldName, file) {
    const binary = await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = (event) => {
        resolve(event.target.result);
      };
      fr.readAsArrayBuffer(file);
    })

    return this.toUploadBinaryRequest(fieldName, file.name, binary)
  }

  /**
   * @deprecated use _toUploadBinaryRequest
   *
   * @param {string} fieldName
   * @param {string} fileName
   * @param {any} binary
   */
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

  _toPostRequest() {
    return new Request(`/jsonapi/${this.entityType}/${this.entityBundle}`, {
      method: 'POST',
      headers: { ...TypeHeaders },
      body: JSON.stringify(this._serialize()),
    })
  }

  _toPatchRequest() {
    if (!this.entityUuid) {
      throw new MalformedEntity('Entity is missing UUID but was used in a PATCH request.')
    }

    return new Request(`/jsonapi/${this.entityType}/${this.entityBundle}/${this.entityUuid}`, {
      method: 'PATCH',
      headers: { ...TypeHeaders },
      body: JSON.stringify(this._serializeChanges()),
    })
  }

  /**
   * Get required fields for this entity.
   */
  _toFieldConfigRequest() {
    return new Request(`/jsonapi/field_config/field_config?filter[entity_type]=${
      this.entityType
    }&filter[bundle]=${
      this.entityBundle
    }`, {
      headers: { ...TypeHeaders },
    })
  }

  /**
   * Build a request to save the entity.
   *
   * This will be either a POST or a PATCH depending on
   * whether or not this is a new entity.
   */
  _toSaveRequest() {
    return (
      (this._enforceNew === true || !this.entityUuid)
        ? this.toPostRequest()
        : this.toPatchRequest()
    )
  }

  /**
   * Save this entity.
   */
  save() {
    GlobalClient.send(this._toSaveRequest())
  }

  /**
   * Build a request to delete the entity.
   *
   * This will return a DELETE request.
   */
  _toDeleteRequest() {
    if (!this.entityUuid) {
      throw new MalformedEntity('Cannot delete an entity without a UUID.')
    }

    return new Request(`/jsonapi/${this.entityType}/${this.entityBundle}/${this.entityUuid}`, {
      method: 'DELETE',
      headers: { ...TypeHeaders },
    })
  }

  /**
   * Delete this entity.
   */
  delete() {
    GlobalClient.send(this._toDeleteRequest())
  }
}