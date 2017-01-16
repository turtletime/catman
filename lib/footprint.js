function Footprint(entity) {
  const rect = new PIXI.Graphics()
  rect.lineStyle(0, 0x00000, 0);

  const onChanged = () => {
    rect.beginFill(0x66CCFF);
    rect.drawRect(0, 0, entity.getWidth() * Game.camera.zoom, entity.getHeight() * Game.camera.zoom)
    rect.endFill();
    rect.x = (entity.getX() - entity.getWidth() / 2 + Game.camera.x) * Game.camera.zoom
    rect.y = (entity.getY() - entity.getHeight() / 2 + Game.camera.y) * Game.camera.zoom
  }
  onChanged()
  
  entity.on("changed", onChanged)
  Game.stage.addChild(rect)
}

module.exports = Footprint
