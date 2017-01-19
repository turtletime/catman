const Controller = require('./core/controller.js')
const lerp = require('./util/game-utils.js').lerp

const PLAYER_SPEED = 0.8

module.exports = {
  Start: class extends Controller {
    during() {
      return new Promise((resolve, reject) => {
        if (this.state.controller.stopMovement) {
          reject(new Error('Movement has already been started'))
          return
        }

        const scene = this.state.scene
        const keys = [{
          friendlyName: 'left arrow',
          keyCode: 37,
          onDown: () => scene.joy.x = -1,
          onUp: () => scene.joy.x = 0
        }, {
          friendlyName: 'up arrow',
          keyCode: 38,
          onDown: () => scene.joy.y = -1,
          onUp: () => scene.joy.y = 0
        }, {
          friendlyName: 'right arrow',
          keyCode: 39,
          onDown: () => scene.joy.x = 1,
          onUp: () => scene.joy.x = 0
        }, {
          friendlyName: 'down arrow',
          keyCode: 40,
          onDown: () => scene.joy.y = 1,
          onUp: () => scene.joy.y = 0
        }].reduce((prev, curr) => {
          prev[curr.keyCode] = {
            onDown: curr.onDown,
            onUp: curr.onUp
          }
          return prev
        }, {})
        let animationFrame = 0
        const onUpdate = () => {
          scene.entities.forEach(entity => entity.onUpdate())
          scene.camera.setX(lerp(scene.camera.getX(), -scene.player.getX(), 0.1), true)
          scene.camera.setY(lerp(scene.camera.getY(), -scene.player.getY(), 0.1))
          scene.player.setVx(PLAYER_SPEED * scene.joy.x, true)
          scene.player.setVy(PLAYER_SPEED * scene.joy.y)
          scene.ticks++
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
        this.state.input.events.on('update', onUpdate)
        this.state.input.events.on('down', onDown)
        this.state.input.events.on('up', onUp)

        const actionLoop = () => {
          this.state.input.events.emit('update') // TODO: separate event
          if (animationFrame !== -1) {
            animationFrame = window.requestAnimationFrame(actionLoop)
          }
        }
        actionLoop()

        this.state.controller.stopMovement = () => {
          this.state.input.events.removeListener('down', onDown)
          this.state.input.events.removeListener('up', onUp)
          this.state.input.events.removeListener('update', onUpdate)
          this.state.scene.joy.x = 0
          this.state.scene.joy.y = 0
          if (animationFrame) {
            window.cancelAnimationFrame(animationFrame)
            animationFrame = -1
          }
        }
        resolve()
      })
    }
  },
  End: class extends Controller {
    async during() {
      this.state.controller.stopMovement()
      this.state.controller.stopMovement = null
    }
  }
}