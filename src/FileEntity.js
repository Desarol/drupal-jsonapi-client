import GlobalClient from './GlobalClient'
import Entity from './Entity'

const setPolyfill = () => {
  global.File = function File() {}
  global.FileReader = function FileReader() {}
}

// File class does not exist in node.js
if (File === undefined || FileReader === undefined) {
  setPolyfill()
}

// Named FileEntity to avoid namespace collisions in browsers
export default class FileEntity extends Entity {
  static async Upload(fileOrBinary, name, entityType, entityBundle, fieldName) {
    let fileName = name
    let binary

    if (fileOrBinary instanceof File) {
      binary = await new Promise((resolve) => {
        const fr = new FileReader();
        fr.onload = (event) => {
          resolve(event.target.result);
        };
        fr.readAsArrayBuffer(fileOrBinary);
      })

      if (name === null) {
        fileName = fileOrBinary.name
      }
    } else {
      binary = fileOrBinary
    }

    const response = await GlobalClient.send(
      new Request(`/jsonapi/${entityType}/${entityBundle}/${fieldName}`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.api+json',
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `file; filename="${fileName}"`,
        },
        body: binary,
      }),
    )
    const json = response.data

    const fileEntity = new FileEntity()
    fileEntity._applySerializedData(json.data)
    return fileEntity
  }

  constructor(uuid) {
    super('file', 'file', uuid)
  }
}
