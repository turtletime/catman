module.exports = {
  'init-scene': async function() {
    const stage = new PIXI.Container()
    this.sceneTree.addChild(stage)

    const scene = { joy: { x: 0, y: 0 } }
    this.state.scene = scene
    scene.stage = stage
    scene.camera = this.instantiate('camera')
    scene.camera.toScreenX = (x) => Math.round((x + scene.camera.x) * scene.camera.zoom + this.state.graphics.dimensions.x / 2)
    scene.camera.toScreenY = (y) => Math.round((y + scene.camera.y) * scene.camera.zoom + this.state.graphics.dimensions.y / 2)
    scene.camera.toFieldX = (x) => (x - this.state.graphics.dimensions.x / 2) / scene.camera.zoom - scene.camera.x
    scene.camera.toFieldY = (y) => (y - this.state.graphics.dimensions.y / 2) / scene.camera.zoom - scene.camera.y
    scene.entities = []
    scene.player = null

    await this.invoke('enable-sprites')
  }
}