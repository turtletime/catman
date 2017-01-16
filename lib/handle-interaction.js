const inRectangle = require('./game-utils.js').inRectangle;

module.exports = () => {
  if (!Game.player) {
    return;
  }

  if (Game.interactionMode === 'movement') {
    // observe what's in front of the player
    let x = Game.player.getX() + Game.player.getDx() * Game.player.getWidth()
    let y = Game.player.getY() + Game.player.getDy() * Game.player.getHeight()

    let target = null
    Game.entities.forEach(entity => {
      if (target || target === Game.player) {
        return;
      }
      if (inRectangle(x, y, entity.__props.x, entity.__props.y, entity.__props.width, entity.__props.height)) {
        target = entity;
      }
    })

    if (target && target.flavorText) {
      Game.interactionMode = 'text'
      Game.text.reset(target.flavorText)
    }
  } else if (Game.interactionMode === 'text') {
    if (!Game.text.advance()) {
      Game.interactionMode = 'movement'
    }
  }
}