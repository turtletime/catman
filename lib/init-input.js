const EventEmitter = require('events')
const Controller = require('./core/controller.js')

module.exports = class InitInputController extends Controller {
  async during() {
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