import GlobalClient from './GlobalClient'
import Entity from './Entity'

(function PolyfillFiles(scope) {
  if (scope.File) {
    return;
  }

  scope.File = function File() {} // eslint-disable-line
  scope.FileReader = function FileReader() {} // eslint-disable-line
}(
  (
    typeof process !== 'undefined'
    && {}.toString.call(process) === '[object process]'
  )
  || (
    typeof navigator !== 'undefined'
    && navigator.product === 'ReactNative'
  ) ? global
    : self // eslint-disable-line
));

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

    const response = await GlobalClient.send({
      url: `/jsonapi/${entityType}/${entityBundle}/${fieldName}`,
      method: 'POST',
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `file; filename="${fileName}"`,
      },
      data: binary,
    })
    const json = response.data

    const fileEntity = new FileEntity()
    fileEntity._applySerializedData(json.data)
    return fileEntity
  }

  /**
   * Delete a remote file.
   *
   * @param {string} fileUuid
   */
  static async Delete(fileUuid) {
    return super.Delete('file', 'file', fileUuid);
  }

  constructor(uuid) {
    super('file', 'file', uuid)
  }
}
