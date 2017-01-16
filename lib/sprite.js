function Sprite(entity, texture) {
  if (!texture && entity.name) {
    texture = `assets/${entity.name}.png`
  }

  if (!PIXI.loader.resources[texture]) {
    return;
  }

  const pixiSprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture)
  pixiSprite.anchor = {
    x: 0.5,
    y: 1.0
  }

  const onChanged = () => {
    pixiSprite.x = (entity.getX() + Game.camera.x) * Game.camera.zoom
    pixiSprite.y = (entity.getY() + entity.getHeight() / 2 + Game.camera.y) * Game.camera.zoom
  }
  onChanged()

  entity.on("changed", onChanged)
  Game.stage.addChild(pixiSprite)

  this.teardown = () => {
    Game.stage.removeChild(pixiSprite)
  }
}

module.exports = Sprite
