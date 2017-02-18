const EventEmitter = require('events')

global.Loop = class Loop {
  constructor() {
    this.map = new Map()
    this.events = new EventEmitter()
    this.isRunning = false
    this.frameTime = 1.0 / 60
    this.events.on('a', () => {
      for (let cb of this.map) {
        cb[1]()
      }
    }, this.frameTime)
  }

  schedule(key, cb) {
    this.map.set(key, cb)
  }

  unschedule(key) {
    this.map.delete(key)
  }

  run() {
    if (this.isRunning) {
      stop()
    }
    this.isRunning = true
    let loop = () => {
      if (this.isRunning) {
        this.frame = requestAnimationFrame(loop)
        this.events.emit('a')
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