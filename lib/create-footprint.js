module.exports = class extends Action {
  async create(entity) {
    this.entity = entity
    this.rect = new PIXI.Graphics()
    this.rect.lineStyle(0, 0x00000, 0)

    this.onChanged = () => {
      this.rect.beginFill(0x66CCFF)
      const zoom = this.state.scene.camera.zoom
      this.rect.drawRect(0, 0, this.entity.width * zoom, this.entity.height * zoom)
      this.rect.endFill()
      this.rect.x = this.state.scene.camera.toScreenX(this.entity.x - this.entity.width / 2)
      this.rect.y = this.state.scene.camera.toScreenY(this.entity.y - this.entity.height / 2)
      this.rect.zOrder = -this.rect.y
    }
    this.onChanged()
    
    this.entity.events.on("changed", this.onChanged)
    this.state.scene.camera.events.on("changed", this.onChanged)
    this.state.scene.stage.addChild(this.rect)
    this.rect.displayGroup = this.state.graphics.displayGroups.spriteGroup

    this.destroy = () => {
      this.entity.events.removeListener("changed", this.onChanged)
      this.state.scene.camera.events.removeListener("changed", this.onChanged)
      this.state.scene.stage.removeChild(this.rect)
    }
  }
}
