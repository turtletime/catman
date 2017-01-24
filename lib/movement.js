const lerp = require('./util/math-utils.js').lerp

const PLAYER_SPEED = 0.8

module.exports = {
  start: class extends Action {
    execute() {
      return new Promise((resolve, reject) => {
        if (this.state.Action.stopMovement) {
          reject(new Error('Movement has already been started'))
          return
        }

        const scene = this.state.scene
        const keys = {
          [this.constants.input.left]: {
            onDown: () => scene.joy.x = -1,
            onUp: () => scene.joy.x = 0
          },
          [this.constants.input.up]: {
            onDown: () => scene.joy.y = -1,
            onUp: () => scene.joy.y = 0
          },
          [this.constants.input.right]: {
            onDown: () => scene.joy.x = 1,
            onUp: () => scene.joy.x = 0
          },
          [this.constants.input.down]: {
            onDown: () => scene.joy.y = 1,
            onUp: () => scene.joy.y = 0
          }
        }
        const onDown = (keyCode) => {
          if (keys[keyCode]) {
            keys[keyCode].onDown()
          }
        }
        const onUp = (keyCode) => {
          if (keys[keyCode]) {
            keys[keyCode].onUp()
          }
        }
        this.events.input.on('down', onDown)
        this.events.input.on('up', onUp)

        this.loop.schedule('movement', () => {
          scene.entities.forEach(entity => entity.onUpdate())
          scene.camera.x = lerp(scene.camera.x, -scene.player.x, 0.1)
          scene.camera.y = lerp(scene.camera.y, -scene.player.y, 0.1)
          this.events.camera.emit('changed')
          scene.player.vx = PLAYER_SPEED * scene.joy.x
          scene.player.vy = PLAYER_SPEED * scene.joy.y
          scene.ticks++
        })

        this.state.Action.stopMovement = () => {
          this.events.input.removeListener('down', onDown)
          this.events.input.removeListener('up', onUp)
          this.state.scene.joy.x = 0
          this.state.scene.joy.y = 0
          this.loop.unschedule('movement')
        }
        resolve()
      })
    }
  },
  end: class extends Action {
    async execute() {
      this.state.Action.stopMovement()
      this.state.Action.stopMovement = null
    }
  }
}