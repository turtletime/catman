const EventEmitter = require('events')

class Action {
  constructor(parent) {
    Object.keys(parent).forEach(key => {
      if (typeof(parent[key]) !== 'function') {
        this[key] = parent[key]
      }
    })
  }
  async execute() {}
  async invoke(actionClass, ...args) {
    if (!this.actions[actionClass]) {
      this.logger.error(`${JSON.stringify(actionClass)}: not an action`)
      return
    }
    if (this.actions[actionClass].prototype.execute) {
      this.logger.warn(`${JSON.stringify(actionClass)}: implemented with deprecated structure`)
      const action = new this.actions[actionClass](this)
      const result = await action.execute.apply(action, args)
      return result
    } else {
      return this.actions[actionClass].apply(this, args)
    }
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
  instantiate(modelClass, ...mixins) {
    return JSON.parse(
      JSON.stringify(
        Object.assign.apply(
          null,
          [{}, modelClass ? this.models[modelClass] : {}].concat(mixins)
        )
      )
    )
  }

  static async main(actionClass) {
    const action = new actionClass({
      actions: {},
      state: {}
    })
    // for debugging
    global._game = action
    await action.execute()
  }
}

global.Action = Action
