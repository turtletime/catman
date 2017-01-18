// TODO split to math utils
const _ = require('lodash')

module.exports = {
  intersects: (x1, y1, w1, h1, x2, y2, w2, h2) => {
    return !(x1 + w1 / 2 < x2 - w2 / 2 || x2 + w2 / 2 < x1 - w1 / 2 || y1 + h1 / 2 < y2 - h2 / 2 || y2 + h2 / 2 < y1 - h1 / 2)
  },
  inRectangle: (x1, y1, x2, y2, w2, h2) => {
    return x2 - w2 / 2 < x1 && x2 + w2 / 2 > x1 && y2 - h2 / 2 < y1 && y2 + h2 / 2 > y1
  },
  lerp: (a, b, t) => a * (1 - t) + b * t,
  createPropsOnObject: (obj, props) => {
    obj.__props = props;
    obj.__props.dirty = false
    Object.keys(obj.__props).forEach((property) => {
      obj[`get${_.capitalize(property)}`] = () => obj.__props[property]
      obj[`set${_.capitalize(property)}`] = (value, silent) => {
        if (obj.__props[property] !== value) {
          obj.__props[property] = value
          if (silent !== true) {
            obj.events.emit('changed')
          } else {
            obj.__props.dirty = true
          }
        } else {
          if (obj.__props.dirty) {
            obj.events.emit('changed')
            obj.__props.dirty = false
          }
        }
      }
      obj[`offset${_.capitalize(property)}`] = (value, silent) => {
        if (value !== 0) {
          obj.__props[property] += value
          if (silent !== true) {
            obj.events.emit('changed')
          } else {
            obj.__props.dirty = true
          }
        } else {
          if (obj.__props.dirty) {
            obj.events.emit('changed')
            dirty = false
          }
        }
      }
    })
  }
}