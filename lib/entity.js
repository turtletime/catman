const EventEmitter = require('events')
const _ = require('lodash')
const clamp = require('./game-utils.js').clamp
const intersects = require('./game-utils.js').intersects
const Sprite = require('./sprite.js')
const Footprint = require('./footprint.js')

function Entity(name) {
  this.name = name
  this.data = {}

  const props = {
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    vx: 0,
    vy: 0,
    dx: 0,
    dy: 1
  }

  this.__props = props;

  const events = new EventEmitter();

  Object.keys(props).forEach((property) => {
    this[`get${_.capitalize(property)}`] = () => props[property]
    this[`set${_.capitalize(property)}`] = (value, silent) => {
      if (props[property] !== value) {
        props[property] = value
        if (silent !== true) {
          events.emit('changed')
        }
      }
    }
    this[`offset${_.capitalize(property)}`] = (value, silent) => {
      if (value !== 0) {
        props[property] += value
        if (silent !== true) {
          events.emit('changed')
        }
      }
    }
  })

  this.onUpdate = (() => {
    if (props.vx !== 0 || props.vy !== 0) {
      let canMove = true;
      Game.entities.forEach((entity) => {
        if (entity === this || entity.tags.includes('no-collide')) {
          return;
        }
        if (intersects(props.x + props.vx, props.y + props.vy, props.width, props.height,
          entity.__props.x, entity.__props.y, entity.__props.width, entity.__props.height)) {
            canMove = false;
            events.emit('collided', entity)
            return;
          }
      });
      if (canMove) {
        props.dx = Math.sign(props.vx)
        props.dy = Math.sign(props.vy)
        props.x += props.vx
        props.y += props.vy
        events.emit('changed')
      }
    }
  }).bind(this)

  this.on = (event, fn) => events.addListener(event, fn)
  Game.entities.push(this)

  // Set up visuals
  if (Game.debug) {
    this.footprint = new Footprint(this)
  }
  this.sprite = new Sprite(this)
  if (!this.sprite.teardown) {
    this.sprite = null
  }

  this.teardown = () => {
    if (this.sprite) {
      this.sprite.teardown()
    }
    if (this.footprint) {
      this.footprint.teardown()
    }
    events.removeAllListeners()
  }
}

module.exports = Entity;
