const GameObject = require('../core/game-object.js')

module.exports = class Sprite extends GameObject {
  async init(entity) {
    this.entity = entity
    let texture = `assets/${entity.asset}.png`

    if (!PIXI.loader.resources[texture]) {
      return;
    }

    this.onChanged = () => {
      this.pixiSprite.x = this.gameState.scene.camera.toScreenX(this.entity.getX())
      this.pixiSprite.y = this.gameState.scene.camera.toScreenY(this.entity.getY() + this.entity.getHeight() / 2)
      this.pixiSprite.zOrder = -this.pixiSprite.y
    }

    this.pixiSprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture)
    this.pixiSprite.anchor = {
      x: 0.5,
      y: 1.0
    }

    this.onChanged()

    this.entity.events.on("changed", this.onChanged)
    this.gameState.scene.camera.events.on("changed", this.onChanged)
    this.pixiSprite.displayGroup = this.gameState.graphics.displayGroups.spriteGroup
    this.gameState.scene.stage.addChild(this.pixiSprite)
  }

  async destroy() {
    if (this.pixiSprite) {
      entity.events.removeListener("changed", this.onChanged)
      this.gameState.scene.camera.events.removeListener("changed", this.onChanged)
      this.gameState.scene.stage.removeChild(this.pixiSprite)
    }
  }
}
