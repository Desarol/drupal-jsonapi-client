import EntityStorage from './EntityStorage'

describe('EntityStorage', () => {
  it('correctly names the interface', async () => {
    const entityStorage = new EntityStorage('node--article')
    expect(entityStorage.interfaceName).toEqual('NodeArticle')
  })
})
