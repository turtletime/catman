module.exports = class extends Action {
  async create(entity) {
    this.entity = entity
    let texture = `assets/${entity.asset}.png`

    this.destroy = () => {
      if (this.pixiSprite) {
        this.entity.events.removeListener("changed", this.onChanged)
        this.state.scene.camera.events.removeListener("changed", this.onChanged)
        this.state.scene.stage.removeChild(this.pixiSprite)
      }
    }

    if (!PIXI.loader.resources[texture]) {
      return;
    }

    this.onChanged = () => {
      this.pixiSprite.x = this.state.scene.camera.toScreenX(this.entity.x)
      this.pixiSprite.y = this.state.scene.camera.toScreenY(this.entity.y + this.entity.height / 2)
      this.pixiSprite.zOrder = -this.pixiSprite.y
    }

    this.pixiSprite = new PIXI.Sprite(PIXI.loader.resources[texture].texture)
    this.pixiSprite.anchor = {
      x: 0.5,
      y: 1.0
    }

    this.onChanged()

    this.entity.events.on("changed", this.onChanged)
    this.state.scene.camera.events.on("changed", this.onChanged)
    this.pixiSprite.displayGroup = this.state.graphics.displayGroups.spriteGroup
    this.state.scene.stage.addChild(this.pixiSprite)
  }
}
