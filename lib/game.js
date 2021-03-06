const EventEmitter = require('events')
require('./core/action.js')
require('./core/loop.js')

PIXI.Container.prototype.printDebug = function(indent) {
  if (!indent) {
    indent = ''
  }
  console.log(`${indent}[${this.constructor.name}] ` +
    `${this[Symbol.for('purpose')]} ` +
    `(x: ${this.x}, y: ${this.y}, ` +
    `z: ${this.displayGroup ? `${this.displayGroup.zIndex}|${this.zOrder}` : this.zOrder}, ` +
    `w: ${this.width}, h: ${this.height})`)
  this.children.forEach(child => {
    child.printDebug(indent + '  ')
  })
}

// This is the game.
class Game extends Action {
  async execute(options) {
    this.state = { Action: {}, debug: !!options.debug, levelEditor: !!options.levelEditor }
    this.constants = require('./util/constants.js')
    this.logger = {
      error: console.log,
      warn: console.log
    }
    this.actions = Object.assign.apply(null, [{
      'init-input': require('./init-input.js'),
      'load-room': require('./room.js').load,
      'save-room': require('./room.js').save,
      'clear-room': require('./room.js').clear,
      'dialog': require('./dialog.js'),
      'idle': require('./idle.js'),
      'start-movement': require('./movement.js').start,
      'end-movement': require('./movement.js').end,
      'fade-in-transition': require('./transition.js').fadeIn,
      'fade-out-transition': require('./transition.js').fadeOut,
      'create-ui': require('./ui.js').create,
      'get-ui': require('./ui.js').get,
      'destroy-ui': require('./ui.js').destroy,
      'wait-on-input': require('./wait-on-input.js'),
      'create-ground': require('./ground.js').create,
      'destroy-ground': require('./ground.js').destroy,
      'invoke': require('./invoke.js'),
      'load-dialogue': require('./dialogue.js').load,
      'run-dialogue': require('./dialogue.js').run,
      'input-field': require('./input-field.js'),
      'player-walk': require('./player-walk.js'),
      'room-card': require('./room-card.js'),
      'obtain-item': require('./item.js').obtain,
      'count-item': require('./item.js').count,
      'set-progress': require('./progress.js').set,
      'get-progress': require('./progress.js').get
    }].concat([
      require('./entity.js'),    
      require('./init-graphics.js'),    
      require('./init-scene.js'),
      require('./footprints.js'),
      require('./joy.js'),
      require('./sprites.js'),
      require('./level-editor.js')
    ]))
    this.models = {
      'entity': Object.assign({}, {
        cavities: [],
        action: 'idle',
        tags: [],
        appearance: {},
        events: {
          collide: [],
          interact: []
        }
      }, {
        position: { x: 0, y: 0 },
        size: { w: 12, h: 12 },
        velocity: { x: 0, y: 0 },
        direction: { x: 0, y: 1 }
        }),
      'cavity': {
        position: { x: 0, y: 0 },
        size: { w: 12, h: 12 },
        margin: 2,
        direction: { x: 0, y: 1 },
        events: {
          collide: [],
          interact: []
        }
      },
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
      'spriteAppearance': {
        id: '',
        columns: 1,
        rows: 1,
        animations: [
          {
            id: 'idle',
            frames: {
              down: [0],
              left: [0],
              right: [0],
              up: [0]
            }
          }
        ]
      },
      'empty': {}
    }
    this.events = {
      'camera': new EventEmitter(),
      'game': new EventEmitter(),
      'input': new EventEmitter(),
      'ui': new EventEmitter()
    }
    this.events.camera.setMaxListeners(100) // TODO
    this.events.game.setMaxListeners(100) // TODO
    this.loop = new Loop()
    this.loop.run()
    this.sceneTree = new PIXI.Container()

    // load data
    await new Promise((resolve) => PIXI.loader
      .add('assets/data.json')
      .load(() => {
        if (this.state.debug && localStorage.getItem('data')) {
          this.rom = JSON.parse(localStorage.getItem('data'))
        } else {
          this.rom = PIXI.loader.resources['assets/data.json'].data
        }  
        resolve()
      }))
    // return // <<<
    // load assets
    await new Promise((resolve) =>
      this.rom.sprites.reduce((loader, asset) =>
        loader.add(asset.id, `assets/${asset.id}.png`), PIXI.loader).load(resolve))
    await new Promise((resolve) => 
      PIXI.loader.add('assets/dialogue.txt')
      .load(resolve)
    ).then(async () => {
      await this.invoke('load-dialogue', PIXI.loader.resources['assets/dialogue.txt'].data)
    })
    await this.invoke('init-graphics', options.width, options.height)
    await this.invoke('init-input')
    await this.invoke('init-scene')
    await this.invoke('create-ui', null, {
      position: { x: 0, y: 0 },
      anchor: { x: 0, y: 0 },
      size: { w: this.state.graphics.screen.w, h: this.state.graphics.screen.h },
      visible: false
    })
    if (this.state.levelEditor) {
      await this.invoke('level-editor')
    } else {
      await this.invoke('load-room', 'start', 'start')
      this.invoke('room-card')
      while (true) {
        // this.sceneTree.printDebug()
        await this.invoke('start-movement')
        const waitResult = await this.invoke('idle')
        await this.invoke('end-movement')
        await this.invoke('invoke', waitResult)
      }
    }  
  }
}

// The main game loop.
global.game = async(options) => {
  await Action.main(Game, options || {})
}
