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
    expect(request.data).toMatchSnapshot()
  })

  it('serializes post request to include entity information', () => {
    const entity = new Entity('node', 'article')
    entity.setAttribute('body', { value: '<p>Drupal rocks!</p>' })
    entity.setRelationship('field_reference', { id: '04808c36-9a01-4503-952d-f4dd88a1186a' })
    const request = entity._toPostRequest()
    expect(request.method).toEqual('POST')
    expect(request.data).toMatchSnapshot()
  })

  it('should not throw an error when serializing a response that does not contain relationships', () => {
    const entity = new Entity('node', 'article')
    entity._applySerializedData({
      id: 'id',
      type: 'node--article',
      attributes: {},
    })
    expect(entity).toMatchSnapshot()
  })

  it('should serialize Entity when passed as relationship', () => {
    const entity = new Entity('node', 'article')
    const relatedEntity = new Entity('user', 'user', 'uuid')
    entity.setRelationship('uid', relatedEntity)
    expect(entity._relationships.uid).toEqual({
      data: {
        id: relatedEntity.entityUuid,
        type: `${relatedEntity.entityType}--${relatedEntity.entityBundle}`,
      },
    })
  })

  it('should serialize an array of entities when passed as relationship', () => {
    const entity = new Entity('node', 'article')
    const relatedEntity1 = new Entity('user', 'user', 'uuid')
    const relatedEntity2 = new Entity('user', 'user', 'uuid')
    entity.setRelationship('uid', [relatedEntity1, relatedEntity2])
    expect(entity._relationships.uid).toEqual({
      data: [{
        id: relatedEntity1.entityUuid,
        type: `${relatedEntity1.entityType}--${relatedEntity1.entityBundle}`,
      }, {
        id: relatedEntity2.entityUuid,
        type: `${relatedEntity2.entityType}--${relatedEntity2.entityBundle}`,
      }],
    })
  })

  it('should return an array of entities when expanding a hasMany relationship', async () => {
    const entity = Entity.FromResponse({
      id: '',
      type: '',
      attributes: {},
      relationships: {
        uid: {
          data: [{
            id: 'uuid-1',
            type: 'user--user',
          }, {
            id: 'uuid-2',
            type: 'user--user',
          }],
        },
      },
    })
    Entity.Cache = {
      'uuid-1': {
        ...Entity.FromResponse({
          type: 'user--user',
          attributes: {
            name: 'Luke Skywalker',
          },
        })._serialize().data,
        id: 'uuid-1',
      },
      'uuid-2': {
        ...Entity.FromResponse({
          type: 'user--user',
          attributes: {
            name: 'Darth Vader',
          },
        })._serialize().data,
        id: 'uuid-2',
      },
    }
    expect(await entity.expand('uid')).toMatchSnapshot()
  })
})
