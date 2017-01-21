const EventEmitter = require('events')

class Loop {
  constructor() {
    this.map = {}
    this.events = new EventEmitter()
    this.isRunning = false
    this.frameTime = 1.0 / 60
  }

  schedule(key, cb) {
    this.map[key] = cb
    this.events.on('a', cb, this.frameTime)
  }

  unschedule(key) {
    this.events.removeListener('a', this.map[key])
    delete this.map[key]
  }

  run() {
    if (this.isRunning) {
      stop()
    }
    this.isRunning = true
    let loop = () => {
      if (this.isRunning) {
        this.events.emit('a')
        this.frame = requestAnimationFrame(loop)
      }
    }
    loop()
  }

  stop() {
    if (!this.isRunning) {
      return
    }
    cancelAnimationFrame(this.frame)
    // TODO: log if there are still active listeners
  }
}

class Action {
  constructor(parent) {
    this.state = parent.state
    this.events = parent.events
    this.actions = parent.actions
    this.models = parent.models
    this.constants = parent.constants
    this.loop = parent.loop
  }
  async execute() {}
  async invoke(actionClass, ...args) {
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
    return Object.assign.apply(this, [{}, modelClass ? this.models[modelClass] : {}].concat(mixins))
  }

  static async main(actionClass) {
    const action = new actionClass({
      state: {},
      events: {},
      actions: {},
      models: {},
      constants: {},
      functions: {},
      loop: new Loop()
    })
    await action.execute()
  }
}

global.Action = Action
