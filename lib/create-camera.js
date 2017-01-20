const EventEmitter = require('events')
const _ = require('lodash')

module.exports = class extends Action {
  getBase() { return 'camera' }
  async create() {
    this.toScreenX = (x) => (x + this.x) * this.zoom + 128
    this.toScreenY = (y) => (y + this.y) * this.zoom + 128
  }
}