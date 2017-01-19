const GameObject = require('../core/game-object.js')
const EventEmitter = require('events')
const clamp = require('../util/game-utils.js').clamp
const intersects = require('../util/game-utils.js').intersects
const Sprite = require('./sprite.js')
const Footprint = require('./footprint.js')
const createPropsOnObject = require('../util/game-utils.js').createPropsOnObject

module.exports = class Entity extends GameObject {
  async init(entity) {
    const entities = this.gameState.scene.entities
    this.name = entity.name
    this.asset = entity.asset
    this.data = entity.data || {}
    this.tags = entity.tags || []
    if (entity.onInteraction) {
      this.onInteraction = entity.onInteraction
    }

    this.events = new EventEmitter();

    createPropsOnObject(this, {
      x: entity.x || 0,
      y: entity.y || 0,
      width: entity.width || 1,
      height: entity.height || 1,
      vx: 0,
      vy: 0,
      dx: 0,
      dy: 1
    })

    this.onUpdate = (() => {
      if (this.__props.vx !== 0 || this.__props.vy !== 0) {
        let canMove = true;
        entities.forEach((entity) => {
          if (entity === this || entity.tags.includes('no-collide')) {
            return;
          }
          if (intersects(this.__props.x + this.__props.vx, this.__props.y + this.__props.vy, this.__props.width, this.__props.height,
            entity.__props.x, entity.__props.y, entity.__props.width, entity.__props.height)) {
              canMove = false;
              this.data.lastCollided = entity
              console.log(`lastCollided: ${entity}`)
              this.events.emit('collided', entity)
              return;
            }
        });
        if (canMove) {
          this.data.lastCollided = null
          this.__props.dx = Math.sign(this.__props.vx)
          this.__props.dy = Math.sign(this.__props.vy)
          this.__props.x += this.__props.vx
          this.__props.y += this.__props.vy
          this.events.emit('changed')
        }
      }
    }).bind(this)

    // Set up visuals
    if (this.gameState.debug) {
      this.footprint = await this.instantiate(Footprint, this)
    }
    this.sprite = await this.instantiate(Sprite, this)
  }

  async destroy() {
    await this.sprite.destroy()
    if (this.footprint) {
      await this.footprint.destroy()
    }
    this.events.removeAllListeners()
  }
};
