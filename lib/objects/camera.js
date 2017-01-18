const GameObject = require('../core/game-object.js')
const EventEmitter = require('events')
const _ = require('lodash')
const createPropsOnObject = require('../util/game-utils.js').createPropsOnObject

module.exports = class Camera extends GameObject {
  async init() {
    this.events = new EventEmitter()

    // TODO turn in to util func
    createPropsOnObject(this, { x: 0, y: 0, zoom: 1 })

    this.toScreenX = (x) => (x + this.getX()) * this.getZoom() + 128
    this.toScreenY = (y) => (y + this.getY()) * this.getZoom() + 128
  }
}