// Load pixi.js and pixi-display extension.
// This creates (and extends) a global object named 'PIXI'.
require('pixi.js')
require('pixi-display')

// This is the game.
const Controller = require('./core/controller.js')
const InitInputController = require('./init-input.js')
const InitGraphicsController = require('./init-graphics.js')
const InitSceneController = require('./init-scene.js')
const LoadRoomController = require('./load-room.js')
const MovementController = require('./movement.js')

class CatmanController extends Controller {
  async during() {
    this.state.rom = require('../assets/data.js')
    this.state.debug = true
    await new Promise((resolve) => PIXI.loader
      .add('assets/catman.png')
      .add('assets/data.json')
      .add('assets/h-tree-1.png')
      .add('assets/h-tree-2.png')
      .load(resolve))
    await this.interject(InitInputController)
    await this.interject(InitGraphicsController)
    await this.interject(InitSceneController)
    await this.interject(LoadRoomController, 'start')
    await this.interject(MovementController)
  }
}

// The main game loop.
const game = async() => {
  await Controller.main(CatmanController);
}
game()