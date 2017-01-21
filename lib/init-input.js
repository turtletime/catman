const EventEmitter = require('events')

module.exports = class extends Action {
  async execute() {
    this.constants.input = {
      up: Symbol(),
      down: Symbol(),
      left: Symbol(),
      right: Symbol()
    }
    this.events.input = new EventEmitter()
    const mapper = {
      37: this.constants.input.left,
      38: this.constants.input.up,
      39: this.constants.input.right,
      40: this.constants.input.down,
      88: this.constants.input.a,
      90: this.constants.input.b
    }
    window.addEventListener('keydown', (event) => {
      this.events.input.emit('down', mapper[event.keyCode])
    })
    window.addEventListener('keyup', (event) => {
      this.events.input.emit('up', mapper[event.keyCode])
    })
  }
}