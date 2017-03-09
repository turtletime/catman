const uuid = require('uuid/v4')
const _ = require('lodash')
const getDirection = require('./util/game-utils.js').getDirection

function createSprite(entity) {
  let sprite = {}
  sprite.entity = entity

  sprite.destroy = () => {
    if (sprite.pixiSprite) {
      this.events.game.removeListener("changed", sprite.onEntityChanged)
      this.events.camera.removeListener("changed", sprite[Symbol.for('changed')])
      this.state.scene.stage.removeChild(sprite.pixiSprite)
      this.loop.unschedule(`sprite-${sprite.uuid}`)
    }
  }

  if (entity.appearance.type && entity.appearance.type !== 'sprite') {
    return
  }

  sprite.appearance = _.find(this.rom.sprites, (spriteDef) => spriteDef.id === entity.appearance.def)

  if (!sprite.appearance || !PIXI.loader.resources[sprite.appearance.id]) {
    this.logger.warn(`sprite for entity ${entity.name} couldn't be found`)
    return
  }
  
  sprite.appearance = this.instantiate('spriteAppearance', sprite.appearance)
  sprite.appearance.yOffset = sprite.appearance.yOffset || 0
  sprite.animation = _.find(sprite.appearance.animations, (animation) => animation.id === entity.action)
  sprite.framesForDirection = sprite.animation.frames[Symbol.keyFor(getDirection(entity.direction.x, entity.direction.y))]

  sprite.pixiSprite = new PIXI.Sprite(
    new PIXI.Texture(PIXI.loader.resources[sprite.appearance.id].texture.baseTexture)
  )
  sprite.pixiSprite[Symbol.for('purpose')] = `entity: ${entity.name}` // for debugging
  sprite.pixiSprite.anchor = {
    x: 0.5,
    y: 1.0
  }

  sprite.uuid = uuid()
  sprite.animationFrame = 0
  sprite.tick = 0
  sprite.direction = entity.direction

  sprite.updateFrame = () => {
    const frame = sprite.framesForDirection[sprite.animationFrame]
    const x = frame % sprite.appearance.columns
    const y = Math.floor(frame / sprite.appearance.columns)
    const width = sprite.pixiSprite.texture.baseTexture.width / sprite.appearance.columns
    const height = sprite.pixiSprite.texture.baseTexture.height / sprite.appearance.rows
    sprite.pixiSprite.texture.frame = new PIXI.Rectangle(x * width, y * height, width, height)
  }
  sprite.updateFrame()

  this.loop.schedule(`sprite-${sprite.uuid}`, () => {
    if (sprite.animation.ticksPerFrame && ++sprite.tick === sprite.animation.ticksPerFrame) {
      sprite.tick = 0
      if (++sprite.animationFrame === sprite.framesForDirection.length) {
        sprite.animationFrame = 0
      }
      sprite.updateFrame()
    }
  })

  sprite[Symbol.for('changed')] = () => {
    sprite.pixiSprite.x = this.state.scene.camera.toScreenX(sprite.entity.position.x)
    sprite.pixiSprite.y = this.state.scene.camera.toScreenY(sprite.entity.position.y + sprite.entity.size.h / 2) + sprite.appearance.yOffset
    sprite.pixiSprite.zOrder = -sprite.pixiSprite.y
    let changed = false
    if (sprite.entity.action !== sprite.animation.id) {
      sprite.animation = _.find(sprite.appearance.animations, (animation) => animation.id === sprite.entity.action)
      sprite.animationFrame = 0
      sprite.tick = 0
      changed = true
    }
    const facing = getDirection(sprite.entity.direction.x, sprite.entity.direction.y)
    if (sprite.direction !== facing) {
      sprite.direction = facing
      sprite.framesForDirection = sprite.animation.frames[Symbol.keyFor(facing)]
      changed = true
    }
    if (changed) {
      sprite.updateFrame()
    }
  }
  sprite[Symbol.for('changed')]()
  sprite.onEntityChanged = (entity) => {
    if (entity === sprite.entity) {
      sprite[Symbol.for('changed')]()
    }
  }

  sprite.pixiSprite.displayGroup = this.state.graphics.displayGroups.spriteGroup
  this.events.game.on("changed", sprite.onEntityChanged)
  this.events.camera.on("changed", sprite[Symbol.for('changed')])
  this.state.scene.stage.addChild(sprite.pixiSprite)
  
  entity[Symbol.for('sprite')] = sprite
}

function destroySprite(entity) {
  if (entity[Symbol.for('sprite')]) {
    entity[Symbol.for('sprite')].destroy()
    delete entity[Symbol.for('sprite')]
  } else {
    this.logger.warn('Entity doesn\'t have footprint, though it should.')
  }
}

module.exports = {
  'enable-sprites': async function() {
    if (!this.state.sprites) {
      this.state.Action.createSprite = createSprite.bind(this)
      this.state.Action.destroySprite = destroySprite.bind(this)
      // Make all existing entities have sprites
      this.state.scene.entities.forEach(this.state.Action.createSprite)
      // Add hook for all new entities
      this.events.game.on('created', this.state.Action.createSprite)
      this.events.game.on('destroyed', this.state.Action.destroySprite)
      this.state.sprites = true
    }
  },
  'disable-sprites': async function() {
    if (this.state.sprites) {
      // Clear sprites from existing entities
      this.state.scene.entities.forEach(this.state.Action.destroySprite)
      // Remove hook
      this.events.game.removeListener('created', this.state.Action.createSprite)
      this.events.game.removeListener('destroyed', this.state.Action.destroySprite)
      this.state.Action.createSprite = null
      this.state.Action.destroySprite = null
      this.state.sprites = false
    }
  }
}
