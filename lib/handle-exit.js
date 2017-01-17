const getHandler = require('./get-handler.js')

module.exports = async (where) => {
  await getHandler('fadeOut', 0.5, 8)()
  Game.entities.forEach(entity => entity.teardown())
  Game.entities = []
  Game.player = null
  await getHandler('loadRoom', where)()
  await getHandler('fadeIn', 0.5, 8)()
  return getHandler('movement')
}
