class Controller {
  constructor(state, controllers) {
    this.state = state
    this.controllers = controllers
    this.init()
  }
  init() {}
  async before() {}
  async during() {}
  async after() {}
  async invoke(controllerClass, ...args) {
    const controller = new this.controllers[controllerClass](this.state, this.controllers)
    await controller.before()
    const result = await controller.during.apply(controller, args)
    await controller.after()
    return result
  }
  async invokeFromObject(obj) {
    if (!obj.args) {
      return await this.invoke(obj.controller)
    } else if (Array.isArray(obj.args)) {
      return await this.invoke.apply(this, [obj.controller].concat(obj.args))
    } else {
      return await this.invoke(obj.controller, obj.args)
    }
  }
  async instantiate(gameObjectClass, ...args) {
    const instance = new gameObjectClass(this.state)
    await instance.init.apply(instance, args)
    return instance
  }

  static async main(controllerClass) {
    const controller = new controllerClass({}, {})
    await controller.before()
    await controller.during()
    await controller.after()
  }
}

module.exports = Controller;