const EventEmitter = require('events')
const _ = require('lodash')

module.exports = function Camera() {
  const props = {
    x: 0,
    y: 0,
    zoom: 1
  }

  this.events = new EventEmitter()

  // TODO turn in to util func
  let dirty = false
  Object.keys(props).forEach((property) => {
    this[`get${_.capitalize(property)}`] = () => props[property]
    this[`set${_.capitalize(property)}`] = ((value, silent) => {
      if (props[property] !== value) {
        props[property] = value
        if (silent !== true) {
          this.events.emit('changed')
        } else {
          dirty = true
        }
      } else {
        if (dirty) {
          this.events.emit('changed')
          dirty = false
        }
      }
    }).bind(this)
    this[`offset${_.capitalize(property)}`] = ((value, silent) => {
      if (value !== 0) {
        props[property] += value
        if (silent !== true) {
          this.events.emit('changed')
        } else {
          dirty = true
        }
      } else {
        if (dirty) {
          this.events.emit('changed')
          dirty = false
        }
      }
    }).bind(this)
  })

  this.toScreenX = (x) => (x + props.x) * props.zoom + 128
  this.toScreenY = (y) => (y + props.y) * props.zoom + 128
}