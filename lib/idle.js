const inRectangle = require('./util/math-utils.js').inRectangle

module.exports = class extends Action {
  execute() {
    return new Promise((resolve, reject) => {
      let cleanup;
      let cleanedUp = false

      const onCollision = (entity1, entity2) => {
        if (entity1 !== this.state.scene.player) {
          return
        }
        if (!cleanedUp && entity2.tags.includes('exit') && entity2.data.dest) {
          cleanup()
          resolve([{
            action: 'fade-out-transition',
            args: [0.5, 8]
          }, {
            action: 'clear-room'
          }, {
            action: 'load-room',
            args: entity2.data.dest
          }, {
            action: 'fade-in-transition',
            args: [0.5, 8]
          }])
        }
      }
      this.events.game.on('collided', onCollision)

      const scene = this.state.scene
      const onDown = (keyCode) => {
        if (keyCode === this.constants.input.a) {
          let target = scene.player.lastCollided
          if (!cleanedUp && target && target.onInteraction) {
            cleanup()
            resolve(target.onInteraction)
          }
        } else if (this.state.debug && keyCode === this.constants.input.select) {
          // enter level editor mode
          resolve({
            action: 'level-editor'
          })
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
