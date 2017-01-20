const intersects = require('./util/game-utils.js').intersects

module.exports = class extends Action {
  getBase() { return 'entity' }
  async create(e) {
    this.merge(e)
    const entities = this.state.scene.entities
    this.onUpdate = () => {
      if (this.vx !== 0 || this.vy !== 0) {
        let canMove = true;
        entities.forEach((entity) => {
          if (entity === this || entity.tags.includes('no-collide')) {
            return;
          }
          if (intersects(this.x + this.vx, this.y + this.vy, this.width, this.height,
            entity.x, entity.y, entity.width, entity.height)) {
              canMove = false;
              this.lastCollided = entity
              console.log(`lastCollided: ${entity}`)
              this.events.emit('collided', entity)
              return;
            }
        });
        if (canMove) {
          this.silent = true
          this.lastCollided = null
          this.dx = Math.sign(this.vx)
          this.dy = Math.sign(this.vy)
          this.x += this.vx
          this.y += this.vy
          this.silent = false
          this.events.emit('changed')
        }
      }
    }

    // Set up visuals
    if (this.state.debug) {
      this.footprint = await this.invoke('create-footprint', this)
    }
    this.sprite = await this.invoke('create-sprite', this)

    this.destroy = () => {
      this.sprite.destroy()
      if (this.footprint) {
        this.footprint.destroy()
      }
      this.events.removeAllListeners()
    }
  }
}
