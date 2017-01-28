const constants = require('./util/constants.js')
const EventEmitter = require('events')

module.exports = class extends Action {
  async execute() {
    this.state.input = { x: 0, y: 0 }
    this.events.input = new EventEmitter()
    const mapper = {
      8: constants.input.select,
      13: constants.input.start,
      37: constants.input.left,
      38: constants.input.up,
      39: constants.input.right,
      40: constants.input.down,
      65: constants.input.y,
      83: constants.input.x,
      88: constants.input.a,
      90: constants.input.b,
      219: constants.input.l,
      221: constants.input.r
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