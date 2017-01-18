const Controller = require('./core/controller.js')
const inRectangle = require('./util/game-utils.js').inRectangle
const lerp = require('./util/game-utils.js').lerp

const PLAYER_SPEED = 0.8

module.exports = class MovementController extends Controller {
  init() {
    const scene = this.state.scene
    this.keys = [{
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

    this.onUpdate = () => {
      scene.entities.forEach(entity => entity.onUpdate())
      scene.camera.setX(lerp(scene.camera.getX(), -scene.player.getX(), 0.1), true)
      scene.camera.setY(lerp(scene.camera.getY(), -scene.player.getY(), 0.1))
      scene.player.setVx(PLAYER_SPEED * scene.joy.x, true)
      scene.player.setVy(PLAYER_SPEED * scene.joy.y)
      scene.ticks++
    }

    this.onCollision = (entity) => {
      if (!this.cleanedUp && entity.tags.includes('exit') && entity.data.dest) {
        this.cleanup()
        this.resolve(['exit', entity.data.dest])
      }
    }

    this.onDown = (keyCode) => {
      if (this.keys[keyCode]) {
        this.keys[keyCode].onDown()
      }
      if (keyCode === 88) {
        let x = scene.player.getX() + scene.player.getDx() * scene.player.getWidth()
        let y = scene.player.getY() + scene.player.getDy() * scene.player.getHeight()

        let target = null
        scene.entities.forEach(entity => {
          if (target || entity === scene.player) {
            return
          }
          if (inRectangle(x, y, entity.__props.x, entity.__props.y, entity.__props.width, entity.__props.height)) {
            target = entity
          }
        })
        if (target && target.onInteraction) {
          this.cleanup()
          this.resolve(['interaction', target])
        }
      }
    }

    this.onUp = (keyCode) => {
      if (this.keys[keyCode]) {
        this.keys[keyCode].onUp()
      }
    }
  }

  async before() {
    this.animationFrame = 0
    this.cleanedUp = false
    this.state.input.events.on('update', this.onUpdate)
    this.state.scene.player.events.on('collided', this.onCollision)
    this.state.input.events.on('down', this.onDown)
    this.state.input.events.on('up', this.onUp)
  }

  during() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      const actionLoop = () => {
        this.state.input.events.emit('update') // TODO: separate event
        if (!this.cleanedUp) {
          this.animationFrame = window.requestAnimationFrame(actionLoop)
        }
      }
      actionLoop()
    })
  }

  async after() {
    this.resolve = null
    this.cleanedUp = true
    this.state.input.events.removeListener('down', this.onDown)
    this.state.scene.player.events.removeListener('collided', this.onCollision)
    this.state.input.events.removeListener('up', this.onUp)
    this.state.input.events.removeListener('update', this.onUpdate)
    this.state.scene.joy.x = 0
    this.state.scene.joy.y = 0
    if (this.animationFrame) {
      window.cancelAnimationFrame(this.animationFrame)
    }
  }
}