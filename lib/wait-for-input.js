const Controller = require('./core/controller.js')
const inRectangle = require('./util/game-utils.js').inRectangle

module.exports = class WaitForInputController extends Controller {
  during() {
    return new Promise((resolve, reject) => {
      let cleanup;
      let cleanedUp = false

      const onCollision = (entity) => {
        if (!cleanedUp && entity.tags.includes('exit') && entity.data.dest) {
          cleanup()
          resolve(['exit', entity.data.dest])
        }
      }
      this.state.scene.player.events.on('collided', onCollision)

      const scene = this.state.scene
      const onDown = (keyCode) => {
        if (keyCode === 88) {
          let target = scene.player.data.lastCollided
          if (!cleanedUp && target && target.onInteraction) {
            cleanup()
            resolve(['interaction', target])
          }
        }
      }
      this.state.input.events.on('down', onDown)

      cleanup = () => {
        this.state.scene.player.events.removeListener('collided', onCollision)
        this.state.input.events.removeListener('down', onDown)
      }
    })
  }
}
