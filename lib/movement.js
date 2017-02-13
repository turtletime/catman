const lerp = require('./util/math-utils.js').lerp

const PLAYER_SPEED = 0.8

module.exports = {
  start: class extends Action {
    async execute() {
      const joy = await this.invoke('create-joy')
      await new Promise((resolve, reject) => {
        if (this.state.Action.stopMovement) {
          reject(new Error('Movement has already been started'))
          return
        }

        const scene = this.state.scene

        this.loop.schedule('movement', () => {
          scene.entities.forEach(entity => entity.onUpdate())
          scene.camera.x = lerp(scene.camera.x, -scene.player.position.x, 0.1)
          scene.camera.y = lerp(scene.camera.y, -scene.player.position.y, 0.1)
          this.events.camera.emit('changed')
          scene.player.velocity.x = this.constants.PLAYER_SPEED * joy.x
          scene.player.velocity.y = this.constants.PLAYER_SPEED * joy.y
          scene.ticks++
        })

        this.state.Action.stopMovement = async () => {
          await joy.destroy()
          this.loop.unschedule('movement')
        }
        resolve()
      })
    }
  },
  end: class extends Action {
    async execute() {
      await this.state.Action.stopMovement()
      this.state.Action.stopMovement = null
    }
  }
}