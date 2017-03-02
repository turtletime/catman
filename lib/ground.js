module.exports = {
  create: async function(perimeter, color) {
    const ground = {}
    ground.rect = new PIXI.Graphics()
    ground.rect[Symbol.for('purpose')] = `ground` // for debugging
    ground.rect.lineStyle(0, 0x00000, 0)
    ground.color = color

    ground[Symbol.for('changed')] = () => {
      ground.rect.clear()
      ground.rect.beginFill(ground.color)
      const zoom = this.state.scene.camera.zoom
      ground.rect.drawRect(0, 0, perimeter.width * zoom, perimeter.height * zoom)
      ground.rect.endFill()
      ground.rect.x = this.state.scene.camera.toScreenX(perimeter.x - perimeter.width / 2)
      ground.rect.y = this.state.scene.camera.toScreenY(perimeter.y - perimeter.height / 2)
      ground.rect.zOrder = 1000 // TODO: bad
    }
    ground[Symbol.for('changed')]()
    
    this.events.camera.on("changed", ground[Symbol.for('changed')])
    this.state.scene.stage.addChild(ground.rect)
    ground.rect.displayGroup = this.state.graphics.displayGroups.spriteGroup

    perimeter[Symbol.for('graphic')] = ground
  },
  destroy: async function(perimeter) {
    const ground = perimeter[Symbol.for('graphic')]
    delete perimeter[Symbol.for('graphic')]
    this.events.camera.removeListener("changed", ground[Symbol.for('changed')])
    this.state.scene.stage.removeChild(ground.rect)
  }
}
