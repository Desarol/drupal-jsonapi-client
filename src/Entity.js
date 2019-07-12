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
      Entity.Cache[entityUuid] = { ...entity._serialize().data, id: entity.entityUuid }
      // Warm EntityCache so future requests for .expand can pull from cache
      if (json.included) {
        json.included.forEach((includedData) => {
          const includedEntity = Entity.FromResponse(includedData)
          Entity.Cache[includedEntity.entityUuid] = {
            ...includedEntity._serialize().data,
            id: includedEntity.entityUuid,
          }
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
          Entity.Cache[includedEntity.entityUuid] = {
            ...includedEntity._serialize().data,
            id: includedEntity.entityUuid,
          }
        })
      }

      return json.data.map((item) => {
        const entity = new Entity()
        entity._applySerializedData(item)
        Entity.Cache[entity.entityUuid] = { ...entity._serialize().data, id: entity.entityUuid }
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
    this.enforceNew = false

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
          if (target._hasField(fieldName)) {
            target.set(fieldName, value)
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
    this._attributes = jsonApiSerialization.attributes || {}
    if (jsonApiSerialization.relationships) {
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
    } else {
      this._relationships = {}
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

  _serialize(withId = true) {
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

    if (withId && this.entityUuid) {
      serialization.data.id = this.entityUuid
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
   * @param {boolean} strict    default: false
   */
  get(fieldName, strict = false) {
    if (typeof this._attributes[fieldName] !== 'undefined') {
      return this._attributes[fieldName]
    }

    if (typeof this._relationships[fieldName] !== 'undefined') {
      return this._relationships[fieldName]
    }

    if (strict) {
      throw new Error(`Failed to find field ${fieldName}.`)
    }

    return null
  }

  /**
   * Set field value.
   *
   * @param {string} fieldName
   * @param {any} fieldValue
   * @param {boolean} strict     default: false
   */
  set(fieldName, fieldValue, strict = false) {
    if (this._attributes[fieldName]) {
      this.setAttribute(fieldName, fieldValue)
      return true
    }

    if (this._relationships[fieldName]) {
      this.setRelationship(fieldName, fieldValue)
      return true
    }

    if (strict) {
      throw new Error(`Failed to set ${fieldName} to ${fieldValue}. Field does not exist.`)
    }

    return false
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
   * Get an expanded representation of a relationship.
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

    if (
      this._relationships[fieldName].data
      && this._relationships[fieldName].data.constructor === Array
    ) {
      return Promise.all(
        this._relationships[fieldName]
          .data
          .map((item) => {
            if (typeof item.type === 'string' && typeof item.id === 'string') {
              const [entityType, entityBundle] = item.type.split('--')
              return Entity.Load(entityType, entityBundle, item.id)
            }

            return null
          })
          .filter(promise => !!promise),
      )
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
    if (fieldValue.constructor === Array) {
      if (fieldValue.every(entity => entity instanceof Entity)) {
        value = {
          data: fieldValue.map(entity => ({
            type: `${entity.entityType}--${entity.entityBundle}`,
            id: entity.entityUuid,
          })),
        }
      }
    }

    this._relationships[fieldName] = value
    this._changes.relationships[fieldName] = value
  }

  /**
   * Save this entity.
   */
  save() {
    return GlobalClient.send((
      (this.enforceNew === true || !this.entityUuid)
        ? ({
          url: `/jsonapi/${this.entityType}/${this.entityBundle}`,
          method: 'POST',
          headers: { ...TypeHeaders },
          data: JSON.stringify(this._serialize(false)),
        })
        : ({
          url: `/jsonapi/${this.entityType}/${this.entityBundle}/${this.entityUuid}`,
          method: 'PATCH',
          headers: { ...TypeHeaders },
          data: JSON.stringify(this._serializeChanges()),
        })
    ))
  }

  /**
   * Delete this entity.
   */
  delete() {
    if (!this.entityUuid) {
      throw new MalformedEntity('Cannot delete an entity without a UUID.')
    }

    return GlobalClient.send({
      url: `/jsonapi/${this.entityType}/${this.entityBundle}/${this.entityUuid}`,
      method: 'DELETE',
      headers: { ...TypeHeaders },
    })
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
