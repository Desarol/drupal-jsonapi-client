import DrupalEntity, { AuthorizeRequest, DrupalEntityFromResponse, DrupalEntityFromSerializedRequiredFields } from './DrupalEntity'

describe('DrupalEntity', () => {
  it('parses response into DrupalEntity request', () => {
    const entity = DrupalEntityFromResponse(require('./__data__/response_1.json')) // eslint-disable-line global-require
    expect(entity.toPostRequest()).toMatchSnapshot()
  })

  it('parses required fields into DrupalEntity request', () => {
    const entity = DrupalEntityFromSerializedRequiredFields(require('./__data__/required_fields.json')) // eslint-disable-line global-require
    expect(entity.toPostRequest()).toMatchSnapshot()
  })

  it('serializes patch request to include changes', () => {
    const entity = new DrupalEntity('node', 'article', '04808c36-9a01-4503-952d-f4dd88a1186a')
    entity.editAttribute('body', { value: '<p>Drupal rocks!</p>' })
    expect(entity.toPatchRequest()).toMatchSnapshot()
  })

  it('serializes post request to include entity information', () => {
    const entity = new DrupalEntity('node', 'article')
    entity.editAttribute('body', { value: '<p>Drupal rocks!</p>' })
    entity.editRelationship('field_reference', { id: '04808c36-9a01-4503-952d-f4dd88a1186a' })
    expect(entity.toPostRequest()).toMatchSnapshot()
  })

  it('serializes get request to retrieve field config for entity', () => {
    const entity = new DrupalEntity('node', 'article')
    expect(entity.toFieldConfigRequest()).toMatchSnapshot()
  })

  it('adds authorization headers', () => {
    const entity = new DrupalEntity('node', 'article')
    expect(AuthorizeRequest(entity.toPostRequest(), 'Basic abc==')).toMatchSnapshot()
  })
})
