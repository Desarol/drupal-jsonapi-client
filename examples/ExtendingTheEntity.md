```js
/*
 You might want to define some default fields for your entities.
 This can be achieved by extending the Entity class.
*/
import { Entity } from 'drupal-jsonapi-client'

class Article extends Entity {
  constructor(articleUuid) {
    super('node', 'article', articleUuid)
    
    this._attributes.title = ''
    this._attributes.body = {
      value: '',
      format: 'basic_html'
    }
  }
}

/*
 Now creating a new Article is simple.
*/
const createAndSaveArticle = async () => {
  const article = new Article('uuid')
  article.title = 'asdf'
  article.body.value = '<p>Hello world!</p>'
  article.save()
}
createAndSaveArticle()
```
