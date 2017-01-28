module.exports = class extends Action {
  async execute() {
    const renderer = PIXI.autoDetectRenderer(256, 256)
    renderer.backgroundColor = 0xcccccc
    document.body.appendChild(renderer.view)
    this.sceneTree.displayList = new PIXI.DisplayList()
    const graphics = {}
    graphics.renderer = renderer
    graphics.displayGroups = {
      spriteGroup: new PIXI.DisplayGroup(0, true),
      uiGroup: new PIXI.DisplayGroup(1, false),
      overlayGroup: new PIXI.DisplayGroup(2, false)
    }
    graphics.screen = { w: 256, h: 256 }
    graphics.baked = {
      blackout: (() => {
        const b = new PIXI.Graphics()
        b.lineStyle(0, 0x000000, 0)
        b.beginFill(0x000000)
        b.drawRect(0, 0, 256, 256)
        b.endFill()
        b.alpha = 0
        b.displayGroup = graphics.displayGroups.overlayGroup
        this.sceneTree.addChild(b)
        return b
      })()
    }
    graphics.dimensions = {
      x: 256,
      y: 256
    }
    this.state.graphics = graphics
    this.loop.schedule('render', renderer.render.bind(renderer, this.sceneTree))
  }
}