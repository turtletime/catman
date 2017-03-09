const inRectangle = require('./util/math-utils.js').inRectangle

module.exports = class extends Action {
  execute() {
    return new Promise((resolve, reject) => {
      let cleanup;
      let cleanedUp = false

      const onCollision = (entity, target) => {
        if (entity !== this.state.scene.player || !target.events.collide) {
          return
        }
        if (!cleanedUp) {
          cleanup()
          resolve(target.events.collide)
        }
      }
      this.events.game.on('collided', onCollision)

      const scene = this.state.scene
      const onDown = (keyCode) => {
        if (keyCode === this.constants.input.a) {
          let target = scene.player.lastCollided
          if (!cleanedUp && target && target.events.interact) {
            cleanup()
            resolve(target.events.interact)
          }
        }
      }
      this.events.input.on('keyDown', onDown)

      cleanup = () => {
        this.events.game.removeListener('collided', onCollision)
        this.events.input.removeListener('keyDown', onDown)
      }
    })
  }
}
