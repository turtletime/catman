// Load pixi.js and pixi-display extension.
// This creates (and extends) a global object named 'PIXI'.
require('pixi.js')
require('pixi-display')

// This is the game.
const Controller = require('./core/controller.js')

class CatmanController extends Controller {
  async during() {
    this.controllers = {
      'init-input': require('./init-input.js'),
      'init-graphics': require('./init-graphics.js'),
      'init-scene': require('./init-scene.js'),
      'load-room': require('./load-room.js'),
      'dialog': require('./dialog.js'),
      'wait-for-input': require('./wait-for-input.js'),
      'start-movement': require('./movement.js').Start,
      'end-movement': require('./movement.js').End
    }

    await new Promise((resolve) => PIXI.loader
      .add('assets/data.json')
      .add('assets/catman.png')
      .add('assets/h-tree-1.png')
      .add('assets/h-tree-2.png')
      .load(resolve))
    this.state.rom = PIXI.loader.resources['assets/data.json'].data
    this.state.controller = {}
    this.state.debug = true
    await this.invoke('init-input')
    await this.invoke('init-graphics')
    await this.invoke('init-scene')
    await this.invoke('load-room', 'start')
    while (true) {
      await this.invoke('start-movement')
      const interactionResult = await this.invoke('wait-for-input')
      await this.invoke('end-movement')
      if (interactionResult[0] === 'interaction') {
        console.log('interacted')
        const target = interactionResult[1]
        if (target.onInteraction) {
          for (let i = 0; i < target.onInteraction.length; i++) {
            await this.invokeFromObject(target.onInteraction[i])
          }
        }
      }
    }
  }
}

// The main game loop.
const game = async() => {
  await Controller.main(CatmanController);
}
game()