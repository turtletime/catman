const inRectangle = require('./util/math-utils.js').inRectangle

module.exports = class extends Action {
  execute() {
    return new Promise((resolve, reject) => {
      let cleanup;
      let cleanedUp = false

      const onCollision = (entity1, entity2) => {
        if (entity1 !== this.state.scene.player || !entity2.events.collide) {
          return
        }
        if (!cleanedUp) {
          cleanup()
          resolve(entity2.events.collide)
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
        } else if (this.state.debug && keyCode === this.constants.input.select) {
          // enter level editor mode
          resolve({ action: 'level-editor-jsx' })
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
