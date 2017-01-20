
const inRectangle = require('./util/game-utils.js').inRectangle

module.exports = class extends Action {
  execute() {
    return new Promise((resolve, reject) => {
      let cleanup;
      let cleanedUp = false

      const onCollision = (entity) => {
        if (!cleanedUp && entity.tags.includes('exit') && entity.data.dest) {
          cleanup()
          resolve([{
            action: 'fade-out',
            args: [0.5, 8]
          }, {
            action: 'clear-room'
          }, {
            action: 'load-room',
            args: entity.data.dest
          }, {
            action: 'fade-in',
            args: [0.5, 8]
          }])
        }
      }
      this.state.scene.player.events.on('collided', onCollision)

      const scene = this.state.scene
      const onDown = (keyCode) => {
        if (keyCode === 88) {
          let target = scene.player.lastCollided
          if (!cleanedUp && target && target.onInteraction) {
            cleanup()
            resolve(target.onInteraction)
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
