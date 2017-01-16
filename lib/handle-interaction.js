module.exports = (target) => new Promise((resolve, reject) => {
  if (!Game.player || !target || !target.flavorText) {
    Game.queueLogic('movement')
    resolve()
    return
  }

  const onDown = (keyCode) => {
    if (keyCode === 88) {
      if (!Game.text.advance()) {
        Game.events.removeListener('down', onDown)
        Game.queueLogic('movement')
        resolve()
      }
    }
  }

  Game.events.on('down', onDown)
  Game.text.reset(target.flavorText)
})