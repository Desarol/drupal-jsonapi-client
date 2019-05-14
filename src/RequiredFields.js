import DrupalEntity from './DrupalEntity'

export default class RequiredFields {
  constructor(entity, fields) {
    this._entity = entity
    this._fields = fields

    this._fields.unshift({
      attributes: {
        machine_name: `${entity.entityType}.${entity.entityBundle}.title`,
        field_name: 'title',
        field_type: 'text',
        label: 'Title',
        description: '',
        required: true,
        translatable: true,
      },
    })
  }

  serialize() {
    return ({
      entity_type: this._entity.entityType,
      entity_bundle: this._entity.entityBundle,
      fields: (
        this
          ._fields
          .filter(field => field.attributes.required)
          .map(field => ({
            machine_name: field.attributes.drupal_internal__id,
            field_name: field.attributes.field_name,
            field_type: field.attributes.field_type,
            label: field.attributes.label,
            description: field.attributes.description,
            translatable: field.attributes.translatable,
          }))
      ),
    })
  }
}

export const RequiredFieldsFromFieldConfigResponse = (jsonApiSerialization) => {
  const fields = jsonApiSerialization.data

  // @todo: throw an error or return an entity with empty attributes and relationships
  if (!fields) {
    return false
  }

  if (fields.length === 0) {
    return false
  }

  return new RequiredFields(
    new DrupalEntity(
      fields[0].attributes.entity_type,
      fields[0].attributes.bundle,
    ),
    fields,
  )
}
