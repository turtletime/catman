module.exports = class extends Action {
  async execute(entity) {
    const footprint = {}
    footprint.entity = entity
    footprint.rect = new PIXI.Graphics()
    footprint.rect.lineStyle(0, 0x00000, 0)

    const onChanged = () => {
      footprint.rect.beginFill(0x66CCFF)
      const zoom = this.state.scene.camera.zoom
      footprint.rect.drawRect(0, 0, footprint.entity.width * zoom, footprint.entity.height * zoom)
      footprint.rect.endFill()
      footprint.rect.x = this.state.scene.camera.toScreenX(footprint.entity.x - footprint.entity.width / 2)
      footprint.rect.y = this.state.scene.camera.toScreenY(footprint.entity.y - footprint.entity.height / 2)
      footprint.rect.zOrder = -footprint.rect.y
    }
    onChanged()

    const onPlayerChanged = (entity) => {
      if (entity === footprint.entity) {
        onChanged()
      }
    }
    
    this.events.game.on("changed", onPlayerChanged)
    this.events.camera.on("changed", onChanged)
    this.state.scene.stage.addChild(footprint.rect)
    footprint.rect.displayGroup = this.state.graphics.displayGroups.spriteGroup

    footprint.destroy = () => {
      this.events.game.removeListener("changed", onPlayerChanged)
      this.events.camera.removeListener("changed", onChanged)
      this.state.scene.stage.removeChild(footprint.rect)
    }
    return footprint
  }
}
