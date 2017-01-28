module.exports = {
  create: class extends Action {
    async execute(color) {
      this.state.scene.perimeters.forEach(perimeter => {
        const footprint = {}
        footprint.rect = new PIXI.Graphics()
        footprint.rect.lineStyle(0, 0x00000, 0)

        const onChanged = () => {
          footprint.rect.beginFill(color)
          const zoom = this.state.scene.camera.zoom
          footprint.rect.drawRect(0, 0, perimeter.width * zoom, perimeter.height * zoom)
          footprint.rect.endFill()
          footprint.rect.x = this.state.scene.camera.toScreenX(perimeter.x - perimeter.width / 2)
          footprint.rect.y = this.state.scene.camera.toScreenY(perimeter.y - perimeter.height / 2)
          footprint.rect.zOrder = 1000 // TODO: bad
        }
        onChanged()
        
        this.events.camera.on("changed", onChanged)
        this.state.scene.stage.addChild(footprint.rect)
        footprint.rect.displayGroup = this.state.graphics.displayGroups.spriteGroup

        footprint.destroy = () => {
          this.events.camera.removeListener("changed", onChanged)
          this.state.scene.stage.removeChild(footprint.rect)
        }
        perimeter.graphic = footprint
      })
    }
  },
  destroy: class extends Action {
    async execute() {
      this.state.scene.perimeters.forEach(perimeter => {
        perimeter.graphic.destroy()
        delete perimeter.graphic
      })
    }
  }
}
