// Load pixi.js and pixi-display extension.
// This creates (and extends) a global object named 'PIXI'.
require('pixi.js')
require('pixi-display')
require('./core/action.js')

// This is the game.
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
      'fade-out': require('./transition.js').fadeOut,
      'create-camera': require('./create-camera.js'),
      'create-entity': require('./create-entity.js'),
      'create-footprint': require('./create-footprint.js'),
      'create-sprite': require('./create-sprite.js'),
      'create-text': require('./create-text.js')
    }
    this.models = {
      'entity': Object.assign({}, {
        name: 'unknown',
        asset: 'unknown',
        data: {},
        tags: [],
        onInteraction: []
      }, {
        x: 0, y: 0,
        width: 1, height: 1,
        vx: 0, vy: 0,
        dx: 0, dy: 1
      }),
      'camera': {
        x: 0,
        y: 0,
        zoom: 1
      },
      'empty': {}
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
  await Action.main(Game)
}
game()