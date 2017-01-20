const EventEmitter = require('events')

class Action {
  constructor(state, actions, models) {
    this.state = state
    this.actions = actions
    this.models = models
  }
  async execute() {
    const base = this.getBase()
    const result = this.instantiate(base)
    result.state = this.state
    result.actions = this.actions
    result.models = this.models
    result.invoke = this.invoke
    result.invokeFromObject = this.invokeFromObject
    result.instantiate = this.instantiate
    await this.create.apply(result, arguments)
    // TODO subtract?
    return result
  }
  getBase() { return 'empty' }
  async create() {}
  async invoke(actionClass, ...args) {
    const action = new this.actions[actionClass](this.state, this.actions, this.models)
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
  instantiate(modelClass) {
    const result = { _data: {}, events: new EventEmitter(), silent: false }
    result.merge = function(obj) {
      Object.keys(obj).forEach(key => {
        if (this._data[key] == null) {
          Object.defineProperty(this, key, {
            get: () => this._data[key],
            set: (v) => {
              const u = this._data[key]
              this._data[key] = v
              if (!this.silent) {
                this.events.emit('changed', key, u, v)
              }
            }
          })
        }
        this._data[key] = obj[key]
      })
    }
    result.merge(this.models[modelClass])
    return result
  }

  static async main(actionClass) {
    const action = new actionClass({}, {}, {})
    await action.execute()
  }
}

global.Action = Action
