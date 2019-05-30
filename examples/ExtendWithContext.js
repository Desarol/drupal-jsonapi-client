import { Entity } from 'drupal-jsonapi-client'


/**
 * Sometimes you might want to extend the default
 * behaviour to provide some custom contextual
 * functionality based on your Drupal site.
 *
 * You can do this by extending the Entity class.
 */
export default class Article extends Entity {
  constructor(uuid, versionId) {
    super('node', 'article', uuid, versionId)
  }

  setTitle(title) {
    this.setAttribute('title', title)
  }

  setRelatedItem(uuid) {
    this.setRelationship('field_relationship', {
      data: {
        type: 'node--related',
        id: uuid,
      },
    })
  }
}
