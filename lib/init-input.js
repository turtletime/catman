const EventEmitter = require('events')

module.exports = class extends Action {
  async execute() {
    this.state.input = { x: 0, y: 0 }
    this.constants.input = ['up', 'down', 'left', 'right', 'a', 'b', 'x', 'y', 'start', 'select', 'l', 'r'].reduce((prev, key) => {
      prev[key] = Symbol()
      return prev
    }, {})
    this.events.input = new EventEmitter()
    const mapper = {
      8: this.constants.input.select,
      13: this.constants.input.start,
      37: this.constants.input.left,
      38: this.constants.input.up,
      39: this.constants.input.right,
      40: this.constants.input.down,
      65: this.constants.input.y,
      83: this.constants.input.x,
      88: this.constants.input.a,
      90: this.constants.input.b,
      219: this.constants.input.l,
      221: this.constants.input.r
    }
    window.addEventListener('keydown', (event) => {
      this.events.input.emit('keyDown', mapper[event.keyCode])
    })
    window.addEventListener('keyup', (event) => {
      this.events.input.emit('keyUp', mapper[event.keyCode])
    })
    window.addEventListener('mousemove', (event) => {
      this.state.input.x = event.clientX
      this.state.input.y = event.clientY
      this.events.input.emit('cursorMove', event.clientX, event.clientY)
    })
    window.addEventListener('mousedown', (event) => {
      if (event.clientX < this.state.graphics.screen.w && event.clientY < this.state.graphics.screen.h) {
        this.events.input.emit('cursorDown', event.clientX, event.clientY)
      }
    })
    window.addEventListener('mouseup', (event) => {
      if (event.clientX < this.state.graphics.screen.w && event.clientY < this.state.graphics.screen.h) {
        this.events.input.emit('cursorUp', event.clientX, event.clientY)
      }
    })
  }
}