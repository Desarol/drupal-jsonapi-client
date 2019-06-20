/* eslint-disable import/first */
require('regenerator-runtime/runtime') // eslint-disable-line

import Entity from './Entity'

describe('Entity', () => {
  it('parses response into DrupalEntity request', () => {
    expect(Entity.FromResponse(require('./__data__/response_1.json'))).toMatchSnapshot() // eslint-disable-line global-require
  })

  it('serializes patch request to include changes', () => {
    const entity = new Entity('node', 'article', '04808c36-9a01-4503-952d-f4dd88a1186a')
    entity.setAttribute('body', { value: '<p>Drupal rocks!</p>' })
    const request = entity._toPatchRequest()
    expect(request.method).toEqual('PATCH')
    expect(request.body.toString()).toMatchSnapshot()
  })

  it('serializes post request to include entity information', () => {
    const entity = new Entity('node', 'article')
    entity.setAttribute('body', { value: '<p>Drupal rocks!</p>' })
    entity.setRelationship('field_reference', { id: '04808c36-9a01-4503-952d-f4dd88a1186a' })
    const request = entity._toPostRequest()
    expect(request.method).toEqual('POST')
    expect(request.body.toString()).toMatchSnapshot()
  })
})
