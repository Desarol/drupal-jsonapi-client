import Resource from './Resource'

class FileResource extends Resource {
  static New({
    type,
    field,
    file,
    fileName,
  }) {
    const [p1, p2] = type.split('--')

    return {
      url: `/${p1}/${p2}/${field}`,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `file; filename="${fileName}"`,
      },
      data: file,
    }
  }
}

export default FileResource
