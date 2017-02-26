function createFootprint(entity) {
  const footprint = {}
  footprint.entity = entity
  footprint.rect = new PIXI.Graphics()
  footprint.rect[Symbol.for('purpose')] = `entity footprint: ${entity.name}` // for debugging
  footprint.rect.lineStyle(0, 0x00000, 0)

  const onChanged = () => {
    footprint.rect.clear()
    footprint.rect.beginFill(0x66CCFF)
    const zoom = this.state.scene.camera.zoom
    footprint.rect.drawRect(0, 0, footprint.entity.size.w * zoom, footprint.entity.size.h * zoom)
    footprint.rect.endFill()
    footprint.rect.x = this.state.scene.camera.toScreenX(footprint.entity.position.x - footprint.entity.size.w / 2)
    footprint.rect.y = this.state.scene.camera.toScreenY(footprint.entity.position.y - footprint.entity.size.h / 2)
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

  entity[Symbol.for('footprint')] = footprint
}

function destroyFootprint(entity) {
  if (entity[Symbol.for('footprint')]) {
    entity[Symbol.for('footprint')].destroy()
    delete entity[Symbol.for('footprint')]
  } else {
    this.logger.warn('Entity doesn\'t have footprint, though it should.')
  }
}

module.exports = {
  'enable-footprints': async function() {
    if (!this.state.footprints) {
      this.state.Action.createFootprint = createFootprint.bind(this)
      this.state.Action.destroyFootprint = destroyFootprint.bind(this)
      // Make all existing entities have footprints
      this.state.scene.entities.forEach(this.state.Action.createFootprint)
      // Add hook for all new entities
      this.events.game.on('created', this.state.Action.createFootprint)
      this.events.game.on('destroyed', this.state.Action.destroyFootprint)
      this.state.footprints = true
    }
  },
  'disable-footprints': async function() {
    if (this.state.footprints) {
      // Clear footprints from existing entities
      this.state.scene.entities.forEach(this.state.Action.destroyFootprint)
      // Remove hook
      this.events.game.removeListener('created', this.state.Action.createFootprint)
      this.events.game.removeListener('destroyed', this.state.Action.destroyFootprint)
      this.state.Action.createFootprint = null
      this.state.Action.destroyFootprint = null
      this.state.footprints = false
    }
  }
}
