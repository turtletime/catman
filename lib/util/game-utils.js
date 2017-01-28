const directions = require('./constants.js').directions

module.exports = {
  // send all complaints to the author of turtle time
  getDirection: (dx, dy) => {
    if (Math.abs(dx) >= Math.abs(dy)) { // either left or right
      if (dx >= 0) {
        return directions.right
      } else {
        return directions.left
      }
    } else {
      if (dy <= 0) {
        return directions.up
      } else {
        return directions.down
      }
    }
  }
}