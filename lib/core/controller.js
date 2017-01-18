class Controller {
  constructor(state) {
    this.state = state
    this.init()
  }
  init() {}
  async before() {}
  async during() {}
  async after() {}
  async interject(controllerClass, ...args) {
    const controller = new controllerClass(this.state)
    await controller.before()
    const result = await controller.during.apply(controller, args)
    await controller.after()
    return result
  }
  async instantiate(gameObjectClass, ...args) {
    const instance = new gameObjectClass(this.state)
    await instance.init.apply(instance, args)
    return instance
  }

  static async main(controllerClass) {
    const controller = new controllerClass({})
    await controller.before()
    await controller.during()
    await controller.after()
  }
}

module.exports = Controller;