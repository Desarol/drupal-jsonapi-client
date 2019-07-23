class EntityTypeManager {
  _addEntityStorage(entityStorageInterfaces) {
    entityStorageInterfaces.forEach((entityStorage) => {
      this[entityStorage.interfaceName] = entityStorage
    })
  }
}

export default EntityTypeManager
