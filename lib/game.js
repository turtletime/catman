// Load pixi.js and pixi-display extension.
// This creates (and extends) a global object named 'PIXI'.
require('pixi.js')
require('pixi-display')
require('./core/action.js')
require('./core/loop.js')
const EventEmitter = require('events')

PIXI.Container.prototype.printDebug = function(indent) {
  if (!indent) {
    indent = ''
  }
  console.log(`${indent}${Object.getPrototypeOf(this)} (x: ${this.x}, y: ${this.y}, w: ${this.width}, h: ${this.height})`)
  this.children.forEach(child => {
    child.printDebug(indent + '  ')
  })
}

// This is the game.
class Game extends Action {
  async execute() {
    this.state = {}
    this.constants = {}
    this.actions = {
      'init-input': require('./init-input.js'),
      'init-graphics': require('./init-graphics.js'),
      'init-scene': require('./init-scene.js'),
      'load-room': require('./room.js').load,
      'save-room': require('./room.js').save,
      'clear-room': require('./room.js').clear,
      'dialog': require('./dialog.js'),
      'idle': require('./idle.js'),
      'start-movement': require('./movement.js').start,
      'end-movement': require('./movement.js').end,
      'fade-in': require('./transition.js').fadeIn,
      'fade-out': require('./transition.js').fadeOut,
      'create-entity': require('./entity.js').create,
      'hydrate-entity': require('./entity.js').hydrate,
      'serialize-entity': require('./entity.js').serialize,
      'destroy-entity': require('./entity.js').destroy,
      'create-footprint': require('./create-footprint.js'),
      'create-sprite': require('./create-sprite.js'),
      'create-ui': require('./ui.js').create,
      'get-ui': require('./ui.js').get,
      'destroy-ui': require('./ui.js').destroy,
      'create-joy': require('./joy.js').create,
      'destroy-joy': require('./joy.js').destroy,
      'level-editor': require('./level-editor.js'),
      'wait-on-input': require('./wait-on-input.js')
    }
    this.models = {
      'entity': Object.assign({}, {
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
      'ui': {
        id: '',
        anchor: { x: 0.5, y: 0.5 },
        position: { x: 0, y: 0 },
        size: { w: 0, h: 0 },
        minSize: { w: null, h: null },
        maxSize: { w: null, h: null },
        appearance: [],
        children: [],
        visible: true
      },
      'empty': {}
    }
    this.events = {
      'camera': new EventEmitter(),
      'game': new EventEmitter(),
      'input': new EventEmitter(),
      'ui': new EventEmitter()
    }
    this.loop = new Loop()
    this.loop.run()
    this.sceneTree = new PIXI.Container()

    await new Promise((resolve) => PIXI.loader
      .add('assets/data.json')
      .add('assets/catman.png')
      .add('assets/h-diner.png')
      .add('assets/h-dogs.png')
      .add('assets/h-firehouse.png')
      .add('assets/h-home.png')
      .add('assets/h-store.png')
      .add('assets/h-tree-1.png')
      .add('assets/h-tree-2.png')
      .load(resolve))
    this.rom = PIXI.loader.resources['assets/data.json'].data
    this.state.Action = {}
    this.state.debug = true
    await this.invoke('init-graphics')
    await this.invoke('init-input')
    await this.invoke('init-scene')
    await this.invoke('create-ui', null, {
      position: { x: 128, y: 128},
      size: { w: 256, h: 256 },
      visible: false
    })
    await this.invoke('load-room', 'start')
    while (true) {
      // this.sceneTree.printDebug()
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