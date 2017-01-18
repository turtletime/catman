const Controller = require('./core/controller.js')
const Camera = require('./objects/camera.js')

module.exports = class InitSceneController extends Controller {
  async during() {
    const stage = new PIXI.Container()
    stage.displayList = new PIXI.DisplayList()
    this.state.graphics.root.addChild(stage)

    const scene = { joy: { x: 0, y: 0 } }
    scene.stage = stage
    scene.camera = await this.instantiate(Camera)
    scene.entities = []
    scene.player = null

    this.state.scene = scene
  }
}