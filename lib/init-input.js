const EventEmitter = require('events')
const Action = require('./core/action.js')

module.exports = class extends Action {
  async execute() {
    const input = {}
    input.events = new EventEmitter()

    window.addEventListener('keydown', (event) => {
      input.events.emit('down', event.keyCode)
    })
    window.addEventListener('keyup', (event) => {
      input.events.emit('up', event.keyCode)
    })

    this.state.input = input
  }
}