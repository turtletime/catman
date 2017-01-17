const getHandler = require('./get-handler.js')

module.exports = (target) => new Promise((resolve, reject) => {
  if (!Game.player || !target || !target.flavorText) {
    resolve(getHandler('movement'))
    return
  }

  const onDown = (keyCode) => {
    if (keyCode === 88) {
      if (!Game.text.advance()) {
        Game.events.removeListener('down', onDown)
        resolve(getHandler('movement'))
      }
    }
  }

  Game.events.on('down', onDown)
  Game.text.reset(target.flavorText)
})