import camelCase from 'lodash/camelCase'
import upperFirst from 'lodash/upperFirst'
import flow from 'lodash/flow'

const pascalCase = flow(camelCase, upperFirst)

class EntityStorage {
  constructor(machineName, properties, required) {
    this.machineName = machineName
    const [entityType, entityBundle] = machineName.split('--')
    this.entityType = entityType
    this.entityBundle = entityBundle
    this.interfaceName = `${pascalCase(machineName)}`
    this.entityProperties = properties
    this.requiredProperties = required
  }
}

export default EntityStorage
