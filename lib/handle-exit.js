const handleLoadRoom = require('./handle-load-room.js')
const handleTransitions = require('./handle-transitions.js')

module.exports = async (where) => {
  await handleTransitions.fadeOut(0.5, 10)
  Game.entities.forEach(entity => entity.teardown())
  Game.entities = []
  Game.player = null
  await handleLoadRoom(where)
  await handleTransitions.fadeIn(0.5, 10)
  Game.queueLogic('movement')
}
