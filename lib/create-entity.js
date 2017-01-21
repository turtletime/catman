const intersects = require('./util/game-utils.js').intersects

module.exports = class extends Action {
  async execute(mixin) {
    const entities = this.state.scene.entities
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
              return;
            }
        });
        if (canMove) {
          newEntity.lastCollided = null
          newEntity.dx = Math.sign(newEntity.vx)
          newEntity.dy = Math.sign(newEntity.vy)
          newEntity.x += newEntity.vx
          newEntity.y += newEntity.vy
          this.events.game.emit('changed', newEntity)
        }
      }
    }

    // Set up visuals
    if (this.state.debug) {
      newEntity.footprint = await this.invoke('create-footprint', newEntity)
    }
    newEntity.sprite = await this.invoke('create-sprite', newEntity)

    newEntity.destroy = () => {
      newEntity.sprite.destroy()
      if (newEntity.footprint) {
        newEntity.footprint.destroy()
      }
    }
    return newEntity
  }
}
