import EntityNotFound from './Error/EntityNotFound'
import MalformedEntity from './Error/MalformedEntity'
import GlobalClient from './GlobalClient'
import QueryParameters from './QueryParameters'

const TypeHeaders = {
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
}

export default class Entity {
  static Cache = {}

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
   * @param {string[]} includeRelationships   default = []
   * @param {boolean} refreshCache            default = false
   */
  static async Load(
    entityType,
    entityBundle,
    entityUuid,
    includeRelationships = [],
    refreshCache = false,
  ) {
    if (Entity.Cache[entityUuid] && refreshCache === false) {
      return Entity.FromResponse(Entity.Cache[entityUuid])
    }

    const queryParameters = new QueryParameters([`include=${includeRelationships.join(',')}`])
    const response = await GlobalClient.send({
      url: `/jsonapi/${entityType}/${entityBundle}/${entityUuid}${includeRelationships.length > 0 ? `?${queryParameters.toString()}` : ''}`,
      method: 'GET',
      headers: TypeHeaders,
    })
    const json = response.data
    if (json && json.data) {
      const entity = Entity.FromResponse(json.data)
      Entity.Cache[entityUuid] = entity._serialize().data
      // Warm EntityCache so future requests for .expand can pull from cache
      if (json.included) {
        json.included.forEach((includedData) => {
          const includedEntity = Entity.FromResponse(includedData)
          Entity.Cache[includedEntity.entityUuid] = includedEntity._serialize().data
        })
      }
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
    include = [],
    pageOffset = 0,
    pageLimit = 50,
  }) {
    const filterQuery = typeof filter.query === 'function' ? filter.query() : filter
    const queryParameters = new QueryParameters([
      filterQuery,
      include.length > 0 ? `include=${include.join(',')}` : null,
      `page[offset]=${pageOffset}`,
      `page[limit]=${pageLimit}`,
    ])

    const response = await GlobalClient.send({
      url: `/jsonapi/${entityType}/${entityBundle}?${queryParameters.toString(Number.MAX_SAFE_INTEGER)}`,
      method: 'GET',
      headers: TypeHeaders,
    })
    const json = response.data

    if (json && json.data && json.data.length && json.data.length > 0) {
      // Warm EntityCache so future requests for .expand can pull from cache
      if (json.included && json.included.length) {
        json.included.forEach((includedData) => {
          const includedEntity = new Entity()
          includedEntity._applySerializedData(includedData)
          Entity.Cache[includedEntity.entityUuid] = includedEntity._serialize().data
        })
      }

      return json.data.map((item) => {
        const entity = new Entity()
        entity._applySerializedData(item)
        Entity.Cache[entity.entityUuid] = entity._serialize().data
        return entity
      })
    }
    return json.data
  }

  /**
   * Delete a remote entity.
   *
   * @param {string} entityType
   * @param {string} entityBundle
   * @param {string} entityUuid
   */
  static async Delete(entityType, entityBundle, entityUuid) {
    return (new Entity(entityType, entityBundle, entityUuid)).delete()
  }

  constructor(
    entityType,
    entityBundle,
    entityUuid,
  ) {
    this.entityType = entityType
    this.entityBundle = entityBundle
    this.entityUuid = entityUuid || null

    this._enforceNew = false
    this._attributes = {}
    this._relationships = {}
    this._changes = {
      attributes: {},
      relationships: {},
    }

    // Setup proxy behaviour for fields
    return new Proxy(this, {
      get: (target, key) => {
        let fieldName = key

        const fieldNameTransformations = {
          nid: 'drupal_internal__nid',
          vid: 'drupal_internal__vid',
        }

        if (fieldName in fieldNameTransformations) {
          fieldName = fieldNameTransformations[fieldName]
        }

        if (!(fieldName in target)) {
          if (target._hasField(fieldName)) {
            return target.get(key)
          }
        }

        return target[key]
      },
      set: (target, key, value) => {
        let fieldName = key

        const fieldNameTransformations = {
          nid: 'drupal_internal__nid',
          vid: 'drupal_internal__vid',
        }

        if (fieldName in fieldNameTransformations) {
          fieldName = fieldNameTransformations[fieldName]
        }

        if (!(fieldName in target)) {
          if (target._attributes[fieldName]) {
            target.setAttribute(fieldName, value)
            // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/set
            // Must return true if property was set successfully
            return true
          }

          if (target._relationships[fieldName]) {
            target.setRelationship(fieldName, value)
            return true
          }
        }

        // eslint-disable-next-line no-param-reassign
        target[fieldName] = value
        return true
      },
    })
  }

  _applySerializedData(jsonApiSerialization) {
    const [entityType, entityBundle] = jsonApiSerialization.type.split('--')
    this.entityType = entityType
    this.entityBundle = entityBundle
    this.entityUuid = jsonApiSerialization.id
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

  _hasField(fieldName) {
    return (
      fieldName in this._attributes
      || fieldName in this._relationships
    )
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
    return {
      url: `/jsonapi/${this.entityType}/${this.entityBundle}/${fieldName}`,
      method: 'POST',
      headers: {
        ...TypeHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `file; filename="${fileName}"`,
      },
      data: binary,
    }
  }

  _toPostRequest() {
    return {
      url: `/jsonapi/${this.entityType}/${this.entityBundle}`,
      method: 'POST',
      headers: { ...TypeHeaders },
      data: JSON.stringify(this._serialize()),
    }
  }

  _toPatchRequest() {
    if (!this.entityUuid) {
      throw new MalformedEntity('Entity is missing UUID but was used in a PATCH request.')
    }

    return {
      url: `/jsonapi/${this.entityType}/${this.entityBundle}/${this.entityUuid}`,
      method: 'PATCH',
      headers: { ...TypeHeaders },
      data: JSON.stringify(this._serializeChanges()),
    }
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
        ? this._toPostRequest()
        : this._toPatchRequest()
    )
  }

  /**
   * Save this entity.
   */
  save() {
    return GlobalClient.send(this._toSaveRequest())
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

    return {
      url: `/jsonapi/${this.entityType}/${this.entityBundle}/${this.entityUuid}`,
      method: 'DELETE',
      headers: { ...TypeHeaders },
    }
  }

  /**
   * Delete this entity.
   */
  delete() {
    return GlobalClient.send(this._toDeleteRequest())
  }

  /**
   * Create a copy of this entity.
   */
  copy(withUuid = true) {
    const copy = new Entity(this.entityType, this.entityBundle)

    copy._attributes = this._attributes
    copy._relationships = this._relationships
    copy._changes = this._changes
    if (withUuid) {
      copy.entityUuid = this.entityUuid
    }

    return copy
  }
}
