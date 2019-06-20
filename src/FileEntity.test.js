/* eslint-disable import/first */
require('regenerator-runtime/runtime') // eslint-disable-line

import FileEntity from './FileEntity'
import GlobalClient from './GlobalClient'

describe('FileEntity', () => {
  it('FileEntity.Delete', async () => {
    GlobalClient.transport = (request) => {
      expect(request).toMatchSnapshot()
      return { data: {} }
    }
    await FileEntity.Delete('1234')
  })
})
