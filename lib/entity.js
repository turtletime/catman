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

      this.events.game.emit('created', newEntity)

      return newEntity
    }
  },
  hydrate: class extends Action {
    async execute(entity) {
      let def = this.rom.entities.filter(e => e.id === entity.def)[0]
      let result = Object.assign({}, def, entity)
      return await this.invoke('create-entity', result)
    }
  },
  serialize: class extends Action {
    async execute(entity) {
      const def = this.rom.entities.filter(e => e.id === entity.def)[0]
      let result = _.omit(entity, Object.keys(def || {}).concat(['velocity']))
      result.position.x = Math.round(result.position.x)
      result.position.y = Math.round(result.position.y)
      delete result.onUpdate
      return result
    }
  },
  destroy: class extends Action {
    async execute(entity) {
      if (!entity) {
        return
      }
      this.events.game.emit('destroyed', entity)
    }
  },
  // This one is for dialogue.txt
  remove: class extends Action {
    async execute(entityName) {
      const entity = this.state.scene.entities.find(e => e.name === entityName)
      // flash entity
      let timer = 60
      await new Promise(resolve => {
        this.loop.schedule('flash-entity', () => {
          entity.sprite.pixiSprite.visible = timer % 10 < 5
          timer--
          if (timer === 0) {
            this.loop.unschedule('flash-entity')
            resolve()
          }
        })
      })
      await this.invoke('destroy-entity', entity)
      _.remove(this.state.scene.entities, e => e === entity)
    }
  }
}
