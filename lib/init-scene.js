module.exports = class extends Action {
  async execute() {
    const stage = new PIXI.Container()
    // stage.displayList = new PIXI.DisplayList()
    this.state.graphics.root.addChild(stage)

    const scene = { joy: { x: 0, y: 0 } }
    this.state.scene = scene
    scene.stage = stage
    scene.camera = this.instantiate('camera')
    scene.camera.toScreenX = (x) => (x + scene.camera.x) * scene.camera.zoom + 128
    scene.camera.toScreenY = (y) => (y + scene.camera.y) * scene.camera.zoom + 128
    scene.entities = []
    scene.player = null
    scene.text = await this.invoke('create-text')
  }
}