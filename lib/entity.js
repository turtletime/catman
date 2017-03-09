const _ = require('lodash')
const intersects = require('./util/math-utils.js').intersects
const containedIn = require('./util/math-utils.js').containedIn

// check if this collided into e2.
// this is NOT symmetric.
const collides = (self, other) => {
  // can't collide in these cases
  if (self === other || self.tags.includes('no-collide') || other.tags.includes('no-collide')) {
    return false;
  }
  let gap = false
  for (const cavity of other.cavities) {
    if (intersects(
      self.position.x + self.velocity.x,
      self.position.y + self.velocity.y,
      self.size.w, self.size.h,
      other.position.x + cavity.position.x + other.velocity.x,
      other.position.y + cavity.position.y + other.velocity.y,
      cavity.size.w, cavity.size.h
    )) {
      return cavity
    } else {
      const bounds = [
        Math.min(cavity.position.x - cavity.size.w / 2 - cavity.margin, -(other.size.w / 2 + 2 * self.size.w) * (cavity.direction.x === -1 ? 1 : 0)), // min x
        Math.max(cavity.position.x + cavity.size.w / 2 + cavity.margin, (other.size.w / 2 + 2 * self.size.w) * (cavity.direction.x === 1 ? 1 : 0)), // max x
        Math.min(cavity.position.y - cavity.size.h / 2 - cavity.margin, -(other.size.h / 2 + 2 * self.size.h) * (cavity.direction.y === -1 ? 1 : 0)), // min y
        Math.max(cavity.position.y + cavity.size.h / 2 + cavity.margin, (other.size.h / 2 + 2 * self.size.h) * (cavity.direction.y === 1 ? 1 : 0)), // max y
      ]
      if (containedIn(
        self.position.x + self.velocity.x,
        self.position.y + self.velocity.y,
        self.size.w, self.size.h,
        other.position.x + other.velocity.x + (bounds[1] + bounds[0]) / 2,
        other.position.y + other.velocity.y + (bounds[3] + bounds[2]) / 2,
        bounds[1] - bounds[0],
        bounds[3] - bounds[2]
      )) {
        gap = true
        break
      }  
    }
  }
  if (gap) {
    return
  }
  if (intersects(
    self.position.x + self.velocity.x,
    self.position.y + self.velocity.y,
    self.size.w, self.size.h,
    other.position.x + other.velocity.x,
    other.position.y + other.velocity.y,
    other.size.w, other.size.h
  )) {
    return other
  }
}

module.exports = {
  'create-entity': async function(mixin) {
    const entities = this.state.scene.entities
    const perimeters = this.state.scene.perimeters
    const newEntity = this.instantiate('entity', mixin)
    for (let i = 0; i < newEntity.cavities.length; i++) {
      newEntity.cavities[i] = this.instantiate('cavity', newEntity.cavities[i])
    }
    newEntity.onUpdate = () => {
      const self = newEntity
      if (self.velocity.x !== 0 || self.velocity.y !== 0) {
        let canMove = true;
        for (const other of entities) {
          const collidedWith = collides(self, other)
          if (collidedWith) {
            canMove = false
            self.lastCollided = collidedWith
            this.events.game.emit('collided', newEntity, collidedWith)
            break
          }
        }
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
  },
  'hydrate-entity': async function(entity) {
    let def = this.rom.entities.filter(e => e.id === entity.def)[0]
    let result = Object.assign({}, def, entity)
    return await this.invoke('create-entity', result)
  },
  'serialize-entity': async function(entity) {
    const def = this.rom.entities.filter(e => e.id === entity.def)[0]
    let result = _.omit(entity, ['velocity', 'onUpdate'])
    result.position.x = Math.round(result.position.x)
    result.position.y = Math.round(result.position.y)
    if (def) {
      Object.keys(def).forEach(defKey => {
        if (_.isEqual(result[defKey], def[defKey])) {
          delete result[defKey]
        }
      })
    }
    return result
  },
  'destroy-entity': async function(entity) {
    if (!entity) {
      return
    }
    this.events.game.emit('destroyed', entity)
  },
  // This one is for dialogue.txt
  'remove-entity': async function(entityName, method) {
    const entity = this.state.scene.entities.find(e => e.name === entityName)
    if (method === 'flashily') {
      // flash entity
      let timer = 60
      await new Promise(resolve => {
        this.loop.schedule('flash-entity', () => {
          entity[Symbol.for('sprite')].pixiSprite.visible = timer % 10 < 5
          timer--
          if (timer === 0) {
            this.loop.unschedule('flash-entity')
            resolve()
          }
        })
      })
    }  
    await this.invoke('destroy-entity', entity)
    _.remove(this.state.scene.entities, e => e === entity)
  }
}
