require('pixi.js')
require('pixi-display')
const _ = require('lodash')
const Camera = require('./camera.js')
const EventEmitter = require('events')
const Text = require('./text.js')
const keyboard = require('./keyboard.js')
const handleMovement = require('./handle-movement.js')
const handleInteraction = require('./handle-interaction.js')
const handleLoadRoom = require('./handle-load-room.js')
const handleExit = require('./handle-exit.js')

const renderer = PIXI.autoDetectRenderer(256, 256)
renderer.backgroundColor = 0xffffff
document.body.appendChild(renderer.view)

const root = new PIXI.Container()
const stage = new PIXI.Container()
stage.displayList = new PIXI.DisplayList()
root.addChild(stage)

const handlers = {
  movement: handleMovement,
  interaction: handleInteraction,
  loadRoom: handleLoadRoom,
  exit: handleExit
}

global.Game = {
  ticks: 0,
  camera: new Camera(),
  data: null,
  blackout: null,
  events: new EventEmitter,
  debug: true,
  debugPrint: (msg) => {
    if (Game.debug) {
      console.log(msg)
    }
  },
  displayGroups: {
    spriteGroup: new PIXI.DisplayGroup(0, true),
    uiGroup: new PIXI.DisplayGroup(1, false),
    overlayGroup: new PIXI.DisplayGroup(2, false)
  },
  entities: [],
  joy: {
    x: 0,
    y: 0
  },
  text: null,
  player: null,
  stage: stage,
  queueLogic: function (event) {
    Game.debugPrint(`queued ${event}`)
    let args = Array.prototype.slice.call(arguments, 1)
    handlerQueue.push(async function() {
      await handlers[event].apply(null, args)
    })
  }
}

let handlerQueue = [];
const gameLoop = async () => {
  while (true) {
    if (handlerQueue.length === 0) {
      break
    }
    Game.debugPrint(`handler queue: ${handlerQueue.length}`);
    await handlerQueue[0]()
    handlerQueue = handlerQueue.slice(1)
  }
}

const setup = () => {
  Game.data = PIXI.loader.resources['assets/data.json'].data

  Game.blackout = new PIXI.Graphics()
  Game.blackout.lineStyle(0, 0x000000, 0)
  Game.blackout.beginFill(0x000000)
  Game.blackout.drawRect(0, 0, 256, 256)
  Game.blackout.endFill()
  Game.blackout.alpha = 0
  Game.blackout.displayGroup = Game.displayGroups.overlayGroup
  stage.addChild(Game.blackout)

  Game.text = new Text()

  window.addEventListener('keydown', (event) => {
    Game.events.emit('down', event.keyCode)
  })

  window.addEventListener('keyup', (event) => {
    Game.events.emit('up', event.keyCode)
  })
  // DRAWING loop
  const renderLoop = () => {
    renderer.render(root)
    requestAnimationFrame(renderLoop)
  }
  renderLoop()

  // if (Game.debug) {
  //   setInterval(() => {
  //     Game.debugPrint(`update called ${Game.ticks} times`)
  //     Game.ticks = 0
  //   }, 1000)
  // }

  // logic
  Game.queueLogic('loadRoom', 'start')
  Game.queueLogic('movement')
  gameLoop()
}

PIXI.loader
  .add('assets/catman.png')
  .add('assets/data.json')
  .add('assets/h-tree-1.png')
  .add('assets/h-tree-2.png')
  .load(setup)
