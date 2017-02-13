const makeSymbols = (arr) => arr.reduce((prev, key) => {
  prev[key] = Symbol.for(key)
  return prev
}, {})

module.exports = {
  input: makeSymbols(['up', 'down', 'left', 'right', 'a', 'b', 'x', 'y', 'start', 'select', 'l', 'r']),
  directions: makeSymbols(['up', 'down', 'left', 'right']),
  PLAYER_SPEED: 0.8
}