const _ = require('lodash')
const intersects = require('./util/math-utils.js').intersects
const containedIn = require('./util/math-utils.js').containedIn

module.exports = {
  create: class extends Action {
    async execute(mixin) {
      const entities = this.state.scene.entities
      const perimeters = this.state.scene.perimeters
      const newEntity = this.instantiate('entity', mixin)
      // entities.push(newEntity)
      newEntity.onUpdate = () => {
        if (newEntity.vx !== 0 || newEntity.vy !== 0) {
          let canMove = true;
          entities.forEach((entity) => {
            if (entity === newEntity || entity.tags.includes('no-collide')) {
              return;
            }
            if (intersects(newEntity.x + newEntity.vx, newEntity.y + newEntity.vy, newEntity.width, newEntity.height,
              entity.x, entity.y, entity.width, entity.height)) {
                canMove = false
                newEntity.lastCollided = entity
                this.events.game.emit('collided', newEntity, entity)
                return
              }
          })
          let inPerimeter = !!_.find(perimeters, (perimeter) => containedIn(
            newEntity.x + newEntity.vx, newEntity.y + newEntity.vy,
            newEntity.width, newEntity.height,
            perimeter.x, perimeter.y, perimeter.width, perimeter.height))
          if (canMove && inPerimeter) {
            newEntity.lastCollided = null
            newEntity.dx = Math.sign(newEntity.vx)
            newEntity.dy = Math.sign(newEntity.vy)
            newEntity.x += newEntity.vx
            newEntity.y += newEntity.vy
            newEntity.action = 'walking'
            this.events.game.emit('changed', newEntity)
          } else if (newEntity.action !== 'walking') {
            newEntity.action = 'walking'
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
      result.x = Math.round(result.x)
      result.y = Math.round(result.y)
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
