module.exports = class extends Action {
  async execute(entity) {
    let sprite = {}
    sprite.entity = entity
    let texture = `assets/${entity.asset}.png`

    sprite.destroy = () => {
      if (sprite.pixiSprite) {
        this.events.game.removeListener("changed", sprite.onEntityChanged)
        this.events.camera.removeListener("changed", sprite.onChanged)
        this.state.scene.stage.removeChild(sprite.pixiSprite)
      }
    }

    if (!PIXI.loader.resources[texture]) {
      return sprite;
    }

    sprite.pixiSprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture)
    sprite.pixiSprite.anchor = {
      x: 0.5,
      y: 1.0
    }

    sprite.onChanged = () => {
      sprite.pixiSprite.x = this.state.scene.camera.toScreenX(sprite.entity.x)
      sprite.pixiSprite.y = this.state.scene.camera.toScreenY(sprite.entity.y + sprite.entity.height / 2)
      sprite.pixiSprite.zOrder = -sprite.pixiSprite.y
    }
    sprite.onChanged()
    sprite.onEntityChanged = (entity) => {
      if (entity === sprite.entity) {
        sprite.onChanged()
      }
    }

    sprite.pixiSprite.displayGroup = this.state.graphics.displayGroups.spriteGroup
    this.events.game.on("changed", sprite.onEntityChanged)
    this.events.camera.on("changed", sprite.onChanged)
    this.state.scene.stage.addChild(sprite.pixiSprite)
    return sprite
  }
}
