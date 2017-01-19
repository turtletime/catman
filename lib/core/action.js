class Action {
  constructor(state, actions) {
    this.state = state
    this.actions = actions
    this.init()
  }
  init() {}
  async execute() {}
  async invoke(actionClass, ...args) {
    const action = new this.actions[actionClass](this.state, this.actions)
    const result = await action.execute.apply(action, args)
    return result
  }
  async invokeFromObject(obj) {
    if (Array.isArray(obj)) {
      let result
      for (let i = 0; i < obj.length; i++) {
        result = await this.invokeFromObject(obj[i])
      }
      return result
    } else if (!obj.args) {
      return await this.invoke(obj.action)
    } else if (Array.isArray(obj.args)) {
      return await this.invoke.apply(this, [obj.action].concat(obj.args))
    } else {
      return await this.invoke(obj.action, obj.args)
    }
  }
  async instantiate(gameObjectClass, ...args) {
    const instance = new gameObjectClass(this.state)
    await instance.init.apply(instance, args)
    return instance
  }

  static async main(actionClass) {
    const action = new actionClass({}, {})
    await action.execute()
  }
}

module.exports = Action;