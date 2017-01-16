const util = require('util')
const Entity = require('./entity.js')

const SPEED = 0.5

function Player(x, y, width, height) {
  Player.super_.call(this, x, y, width, height)

  Game.onUpdate(() => {
    if (Game.interactionMode === 'movement') {
      this.setVx(SPEED * Game.joy.x, true)
      this.setVy(SPEED * Game.joy.y)
    }
  })

  Game.player = this
}

util.inherits(Player, Entity)

module.exports = Player;
