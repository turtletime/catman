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
      console.log(`${JSON.stringify(actionClass)}: not an action`)
    }
    const action = new this.actions[actionClass](this)
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
  schedule(key, cb) {
    this.loop.schedule(key, cb)
  }
  unschedule(key) {
    this.loop.unschedule(key)
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
    await action.execute()
  }
}

global.Action = Action
