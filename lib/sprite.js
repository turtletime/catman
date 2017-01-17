function Sprite(entity) {
  let texture = `assets/${entity.asset}.png`

  if (!PIXI.loader.resources[texture]) {
    return;
  }

  const pixiSprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture)
  pixiSprite.anchor = {
    x: 0.5,
    y: 1.0
  }

  const onChanged = () => {
    pixiSprite.x = Game.camera.toScreenX(entity.getX())
    pixiSprite.y = Game.camera.toScreenY(entity.getY() + entity.getHeight() / 2)
    pixiSprite.zOrder = -pixiSprite.y
  }
  onChanged()

  entity.events.on("changed", onChanged)
  Game.camera.events.on("changed", onChanged)
  pixiSprite.displayGroup = Game.displayGroups.spriteGroup
  Game.stage.addChild(pixiSprite)

  this.teardown = () => {
    entity.events.removeListener("changed", onChanged)
    Game.camera.events.removeListener("changed", onChanged)
    Game.stage.removeChild(pixiSprite)
  }
}

module.exports = Sprite
