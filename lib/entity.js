const _ = require('lodash')
const intersects = require('./util/math-utils.js').intersects
const containedIn = require('./util/math-utils.js').containedIn

module.exports = {
  create: class extends Action {
    async execute(mixin) {
      const entities = this.state.scene.entities
      const perimeters = this.state.scene.perimeters
      const newEntity = this.instantiate('entity', mixin)
      newEntity.onUpdate = () => {
        if (newEntity.velocity.x !== 0 || newEntity.velocity.y !== 0) {
          let canMove = true;
          entities.forEach((entity) => {
            if (entity === newEntity || entity.tags.includes('no-collide')) {
              return;
            }
            if (intersects(
              newEntity.position.x + newEntity.velocity.x,
              newEntity.position.y + newEntity.velocity.y,
              newEntity.size.w, newEntity.size.h,
              entity.position.x, entity.position.y, entity.size.w, entity.size.h)) {
                canMove = false
                newEntity.lastCollided = entity
                this.events.game.emit('collided', newEntity, entity)
                return
              }
          })
          let inPerimeter = !!_.find(perimeters, (perimeter) => containedIn(
            newEntity.position.x + newEntity.velocity.x, newEntity.position.y + newEntity.velocity.y,
            newEntity.size.w, newEntity.size.h,
            perimeter.x, perimeter.y, perimeter.width, perimeter.height))
          if (canMove && inPerimeter) {
            newEntity.lastCollided = null
            newEntity.direction.x = Math.sign(newEntity.velocity.x)
            newEntity.direction.y = Math.sign(newEntity.velocity.y)
            newEntity.action = 'walking'
            newEntity.position.x += newEntity.velocity.x
            newEntity.position.y += newEntity.velocity.y
            this.events.game.emit('changed', newEntity)
          } else if (newEntity.action !== 'walking') {
            newEntity.action = 'walking'
            this.events.game.emit('changed', newEntity)
          } else if (newEntity.direction.x * newEntity.velocity.x <= 0 || newEntity.direction.y * newEntity.velocity.y <= 0) {
            newEntity.direction.x = Math.sign(newEntity.velocity.x)
            newEntity.direction.y = Math.sign(newEntity.velocity.y)
            this.events.game.emit('changed', newEntity)
          }
        } else {
          if (newEntity.action !== 'idle') {
            newEntity.action = 'idle'
            this.events.game.emit('changed', newEntity)
          }
        }
      }

      // Set up visuals
      if (this.state.debug) {
        newEntity.footprint = await this.invoke('create-footprint', newEntity)
      }
      newEntity.sprite = await this.invoke('create-sprite', newEntity)

      return newEntity
    }
  },
  hydrate: class extends Action {
    async execute(entity) {
      let def = this.rom.entities.filter(e => e.id === entity.def)[0]
      let result = Object.assign({}, def, entity)
      result.asset = result.asset || result.id
      return await this.invoke('create-entity', result)
    }
  },
  serialize: class extends Action {
    async execute(entity) {
      const def = this.rom.entities.filter(e => e.id === entity.def)[0]
      let result = _.omit(entity, def)
      result.position.x = Math.round(result.position.x)
      result.position.y = Math.round(result.position.y)
      delete result.onUpdate
      delete result.sprite
      delete result.footprint
      if (result.asset === result.id) {
        delete result.asset
      }
      return result
    }
  },
  destroy: class extends Action {
    async execute(entity) {
      entity.sprite.destroy()
      if (entity.footprint) {
        entity.footprint.destroy()
      }
    }
  }
}
