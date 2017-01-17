module.exports = function getHandler(handlerName) {
  let args = Array.prototype.slice.call(arguments, 1)
  return async () => {
    return await handlers[handlerName].apply(null, args)
  }
}

const handlers = {
  movement: require('./handle-movement.js'),
  interaction: require('./handle-interaction.js'),
  loadRoom: require('./handle-load-room.js'),
  exit: require('./handle-exit.js'),
  fadeIn: require('./handle-transitions.js').fadeIn,
  fadeOut: require('./handle-transitions.js').fadeOut
}
