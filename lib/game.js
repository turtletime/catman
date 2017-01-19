// Load pixi.js and pixi-display extension.
// This creates (and extends) a global object named 'PIXI'.
require('pixi.js')
require('pixi-display')

// This is the game.
const Action = require('./core/action.js')

class Game extends Action {
  async execute() {
    this.actions = {
      'init-input': require('./init-input.js'),
      'init-graphics': require('./init-graphics.js'),
      'init-scene': require('./init-scene.js'),
      'load-room': require('./load-room.js'),
      'clear-room': require('./clear-room.js'),
      'dialog': require('./dialog.js'),
      'idle': require('./idle.js'),
      'start-movement': require('./movement.js').start,
      'end-movement': require('./movement.js').end,
      'fade-in': require('./transition.js').fadeIn,
      'fade-out': require('./transition.js').fadeOut
    }

    await new Promise((resolve) => PIXI.loader
      .add('assets/data.json')
      .add('assets/catman.png')
      .add('assets/h-tree-1.png')
      .add('assets/h-tree-2.png')
      .load(resolve))
    this.state.rom = PIXI.loader.resources['assets/data.json'].data
    this.state.Action = {}
    this.state.debug = true
    await this.invoke('init-input')
    await this.invoke('init-graphics')
    await this.invoke('init-scene')
    await this.invoke('load-room', 'start')
    while (true) {
      await this.invoke('start-movement')
      const waitResult = await this.invoke('idle')
      await this.invoke('end-movement')
      await this.invokeFromObject(waitResult)
    }
  }
}

// The main game loop.
const game = async() => {
  await Action.main(Game);
}
game()