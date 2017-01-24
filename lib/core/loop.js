const EventEmitter = require('events')

global.Loop = class Loop {
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