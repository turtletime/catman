class GameObject {
  constructor(state) {
    this.gameState = state
  }
  async init() {}
  async destroy() {}
  async instantiate(gameObjectClass, ...args) {
    const instance = new gameObjectClass(this.gameState)
    await instance.init.apply(instance, args)
    return instance
  }
}

module.exports = GameObject;
