function Footprint(entity) {
  const rect = new PIXI.Graphics()
  rect.lineStyle(0, 0x00000, 0);

  const onChanged = () => {
    rect.beginFill(0x66CCFF)
    let zoom = Game.camera.getZoom()
    rect.drawRect(0, 0, entity.getWidth() * zoom, entity.getHeight() * zoom)
    rect.endFill()
    rect.x = Game.camera.toScreenX(entity.getX() - entity.getWidth() / 2)
    rect.y = Game.camera.toScreenY(entity.getY() - entity.getHeight() / 2)
    rect.zOrder = -rect.y
  }
  onChanged()
  
  entity.events.on("changed", onChanged)
  Game.camera.events.on("changed", onChanged)
  Game.stage.addChild(rect)
  rect.displayGroup = Game.displayGroups.spriteGroup
  
  this.teardown = () => {
    entity.events.removeListener("changed", onChanged)
    Game.camera.events.removeListener("changed", onChanged)
    Game.stage.removeChild(rect)
  }
}

module.exports = Footprint
