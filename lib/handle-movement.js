const inRectangle = require('./game-utils.js').inRectangle

const PLAYER_SPEED = 0.5

const keys = [{
  friendlyName: 'left arrow',
  keyCode: 37,
  onDown: () => Game.joy.x = -1,
  onUp: () => Game.joy.x = 0
}, {
  friendlyName: 'up arrow',
  keyCode: 38,
  onDown: () => Game.joy.y = -1,
  onUp: () => Game.joy.y = 0
}, {
  friendlyName: 'right arrow',
  keyCode: 39,
  onDown: () => Game.joy.x = 1,
  onUp: () => Game.joy.x = 0
}, {
  friendlyName: 'down arrow',
  keyCode: 40,
  onDown: () => Game.joy.y = 1,
  onUp: () => Game.joy.y = 0
}].reduce((prev, curr) => {
  prev[curr.keyCode] = {
    onDown: curr.onDown,
    onUp: curr.onUp
  }
  return prev
}, {})

module.exports = () => new Promise((resolve, reject) => {
    let animationFrame;
    let cleanup;

    const onUpdate = () => {
      Game.entities.forEach(entity => entity.onUpdate())
      Game.player.setVx(PLAYER_SPEED * Game.joy.x, true)
      Game.player.setVy(PLAYER_SPEED * Game.joy.y)
    }
    Game.events.on('update', onUpdate)

    Game.player.on('collided', (entity) => {
      if (entity.tags.includes('exit') && entity.data.dest) {
        cleanup()
        Game.queueLogic('exit', entity.data.dest)
        resolve()
      }
    })

    const onDown = (keyCode) => {
      if (keys[keyCode]) {
        keys[keyCode].onDown()
      }
      if (keyCode === 88) {
        let x = Game.player.getX() + Game.player.getDx() * Game.player.getWidth()
        let y = Game.player.getY() + Game.player.getDy() * Game.player.getHeight()

        let target = null
        Game.entities.forEach(entity => {
          if (target || entity === Game.player) {
            return
          }
          if (inRectangle(x, y, entity.__props.x, entity.__props.y, entity.__props.width, entity.__props.height)) {
            target = entity
          }
        })
        if (target && target.flavorText) {
          cleanup()
          Game.queueLogic('interaction', target)
          resolve()
        }
      }
    }
    const onUp = (keyCode) => {
      if (keys[keyCode]) {
        keys[keyCode].onUp()
      }
    }
    Game.events.on('down', onDown)
    Game.events.on('up', onUp)

    cleanup = () => {
      Game.events.removeListener('down', onDown)
      Game.events.removeListener('up', onUp)
      Game.events.removeListener('update', onUpdate)
      Game.joy.x = 0
      Game.joy.y = 0
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame)
      }
    }

    let actionLoop = () => {
      Game.events.emit('update')
      animationFrame = window.requestAnimationFrame(actionLoop)
    }
    actionLoop()
  })