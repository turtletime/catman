const uuid = require('uuid/v4')
const _ = require('lodash')
const getDirection = require('./util/game-utils.js').getDirection

module.exports = class extends Action {
  async execute(entity) {
    let sprite = {}
    sprite.entity = entity

    sprite.destroy = () => {
      if (sprite.pixiSprite) {
        this.events.game.removeListener("changed", sprite.onEntityChanged)
        this.events.camera.removeListener("changed", sprite.onChanged)
        this.state.scene.stage.removeChild(sprite.pixiSprite)
        this.loop.unschedule(`sprite-${sprite.uuid}`)
      }
    }

    sprite.assetDef = _.find(this.rom.assets, (asset) => asset.id === entity.asset)

    if (!sprite.assetDef || !PIXI.loader.resources[entity.asset]) {
      return sprite
    }
    
    sprite.assetDef = this.instantiate('asset', sprite.assetDef)
    sprite.animation = _.find(sprite.assetDef.animations, (animation) => animation.id === entity.action)
    sprite.framesForDirection = sprite.animation.frames[Symbol.keyFor(getDirection(entity.direction.x, entity.direction.y))]

    sprite.pixiSprite = new PIXI.Sprite(
      new PIXI.Texture(PIXI.loader.resources[entity.asset].texture.baseTexture)
    )
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
      const x = frame % sprite.assetDef.columns
      const y = Math.floor(frame / sprite.assetDef.columns)
      const width = sprite.pixiSprite.texture.baseTexture.width / sprite.assetDef.columns
      const height = sprite.pixiSprite.texture.baseTexture.height / sprite.assetDef.rows
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

    sprite.onChanged = () => {
      sprite.pixiSprite.x = this.state.scene.camera.toScreenX(sprite.entity.position.x)
      sprite.pixiSprite.y = this.state.scene.camera.toScreenY(sprite.entity.position.y + sprite.entity.size.h / 2)
      sprite.pixiSprite.zOrder = -sprite.pixiSprite.y
      let changed = false
      if (sprite.entity.action !== sprite.animation.id) {
        sprite.animation = _.find(sprite.assetDef.animations, (animation) => animation.id === sprite.entity.action)
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
    sprite.onChanged()
    sprite.onEntityChanged = (entity) => {
      if (entity === sprite.entity) {
        sprite.onChanged()
      }
    }

    sprite.pixiSprite.displayGroup = this.state.graphics.displayGroups.spriteGroup
    this.events.game.on("changed", sprite.onEntityChanged)
    this.events.camera.on("changed", sprite.onChanged)
    this.state.scene.stage.addChild(sprite.pixiSprite)
    return sprite
  }
}
