export default class RequiredFields {
  constructor(entityType, entityBundle, fields) {
    this.entityType = entityType
    this.entityBundle = entityBundle
    this.fields = fields

    this.fields.unshift({
      attributes: {
        machine_name: `${entityType}.${entityBundle}.title`,
        field_name: 'title',
        field_type: 'text',
        label: 'Title',
        description: '',
        translatable: true,
      },
    })
  }

  serialize() {
    return ({
      entity_type: this.entityType,
      entity_bundle: this.entityBundle,
      fields: (
        this
          .fields
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
