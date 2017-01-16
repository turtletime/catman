const handleTransitions = require('./handle-transitions.js')

module.exports = async (where) => {
  await handleTransitions.fadeIn(1)
  Game.entities.forEach(entity => entity.teardown())
  Game.entities = []
  Game.player = null
  await handleTransitions.fadeOut(1)
}
