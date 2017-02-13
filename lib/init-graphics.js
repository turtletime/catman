module.exports = class extends Action {
  async execute(width, height) {
    const renderer = PIXI.autoDetectRenderer(width, height)
    renderer.backgroundColor = 0xcccccc
    document.getElementById('the-game').appendChild(renderer.view)
    this.sceneTree.displayList = new PIXI.DisplayList()
    const graphics = {}
    graphics.renderer = renderer
    graphics.displayGroups = {
      spriteGroup: new PIXI.DisplayGroup(0, true),
      uiGroup: new PIXI.DisplayGroup(1, false),
      overlayGroup: new PIXI.DisplayGroup(2, false)
    }
    graphics.screen = { w: width, h: height }
    graphics.baked = {
      blackout: (() => {
        const b = new PIXI.Graphics()
        b.lineStyle(0, 0x000000, 0)
        b.beginFill(0x000000)
        b.drawRect(0, 0, graphics.screen.w, graphics.screen.h)
        b.endFill()
        b.alpha = 0
        b.displayGroup = graphics.displayGroups.overlayGroup
        this.sceneTree.addChild(b)
        return b
      })()
    }
    graphics.dimensions = {
      x: graphics.screen.w,
      y: graphics.screen.h
    }
    this.state.graphics = graphics
    this.loop.schedule('render', renderer.render.bind(renderer, this.sceneTree))
  }
}