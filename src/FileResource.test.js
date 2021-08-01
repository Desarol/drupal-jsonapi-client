import FileResource from './FileResource'

describe('Resource', () => {
  it('generates a valid request from a .Get call', () => {
    const request = FileResource.New({
      type: 'node--article',
      field: 'field_image',
      file: new Uint8Array(),
      fileName: 'file.jpg',
    })

    expect(request).toMatchSnapshot()
  })
})
