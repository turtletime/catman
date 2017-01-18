const GameObject = require('../core/game-object.js')

module.exports = class Footprint extends GameObject {
  async init(entity) {
    this.entity = entity
    this.rect = new PIXI.Graphics()
    this.rect.lineStyle(0, 0x00000, 0)

    this.onChanged = () => {
      this.rect.beginFill(0x66CCFF)
      const zoom = this.gameState.scene.camera.getZoom()
      this.rect.drawRect(0, 0, this.entity.getWidth() * zoom, this.entity.getHeight() * zoom)
      this.rect.endFill()
      this.rect.x = this.gameState.scene.camera.toScreenX(this.entity.getX() - this.entity.getWidth() / 2)
      this.rect.y = this.gameState.scene.camera.toScreenY(this.entity.getY() - this.entity.getHeight() / 2)
      this.rect.zOrder = -this.rect.y
    }
    this.onChanged()
    
    this.entity.events.on("changed", this.onChanged)
    this.gameState.scene.camera.events.on("changed", this.onChanged)
    this.gameState.scene.stage.addChild(this.rect)
    this.rect.displayGroup = this.gameState.graphics.displayGroups.spriteGroup
  }
  
  async destroy() {
    this.entity.events.removeListener("changed", this.onChanged)
    this.gameState.scene.camera.events.removeListener("changed", this.onChanged)
    this.gameState.scene.stage.removeChild(this.rect)
  }
}
