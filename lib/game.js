require('pixi.js')
const _ = require('lodash')
const EventEmitter = require('events')
const Entity = require('./entity.js')
const Text = require('./text.js')
const keyboard = require('./keyboard.js')
const handleMovement = require('./handle-movement.js')
const handleInteraction = require('./handle-interaction.js')
const handleExit = require('./handle-exit.js')

const renderer = PIXI.autoDetectRenderer(256, 256)
renderer.backgroundColor = 0xffffff
document.body.appendChild(renderer.view)

const root = new PIXI.Container()
const stage = new PIXI.Container()
const fade = new PIXI.Container()
root.addChild(stage, fade)

const handlers = {
  movement: handleMovement,
  interaction: handleInteraction,
  exit: handleExit
}

global.Game = {
  camera: {
    x: 0,
    y: 0,
    zoom: 1
  },
  data: null,
  blackout: null,
  events: new EventEmitter,
  debug: true,
  debugPrint: (msg) => {
    if (Game.debug) {
      console.log(msg)
    }
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
    let args = Array.prototype.slice.call(arguments, 1)
    handlerQueue.push(async function() {
      await handlers[event].apply(null, args)
    })
  }
}

const loadRoom = (room) => {
  room.entities.forEach(entity => {
    let instance
    let def = Game.data.entities.filter(
      e => e.name === entity.name)[0]
    instance = new Entity(entity.name)
    if (def.tags && def.tags.includes('player')) {
      Game.player = instance
    }
    instance.setX(entity.x, true)
    instance.setY(entity.y, true)
    instance.setWidth(def.width, true)
    instance.setHeight(def.height)
    instance.tags = def.tags || []
    instance.flavorText = def.flavorText
  })
  room.perimeters.forEach(p => {
    let t = 5;
    [
      [ p.x, p.y - p.height / 2 - t / 2, p.width, t ],
      [ p.x - p.width / 2 - t / 2, p.y, t, p.height ],
      [ p.x + p.width / 2 + t / 2, p.y, t, p.height ],
      [ p.x, p.y + p.height / 2 + t / 2, p.width, t ]
    ].forEach(bounds => {
      let instance = new Entity('wall')
      instance.setX(bounds[0], true)
      instance.setY(bounds[1], true)
      instance.setWidth(bounds[2], true)
      instance.setHeight(bounds[3])
      instance.flavorText = [
        "It's a wall.",
        "You can't get past it.",
        "Maybe with a certain power-up later in the game, though..."
      ]
      instance.tags = []
    })
  })
  room.exits.forEach(exit => {
    let instance = new Entity('exit')
    instance.setX(exit.x, true)
    instance.setY(exit.y, true)
    instance.setWidth(exit.width, true)
    instance.setHeight(exit.height, true)
    instance.data.dest = exit.dest
    instance.tags = ['exit']
  })
}

let handlerQueue = [];
const gameLoop = async () => {
  while (true) {
    await _.first(handlerQueue)()
    handlerQueue = handlerQueue.slice(1)
    if (handlerQueue.length === 0) {
      break
    }
  }
}

const setup = () => {
  Game.data = PIXI.loader.resources['assets/data.json'].data
  const room = Game.data.rooms.filter(room => room.name === 'start')[0]
  loadRoom(room)

  Game.blackout = new PIXI.Graphics()
  Game.blackout.lineStyle(0, 0x000000, 0)
  Game.blackout.beginFill(0x000000)
  Game.blackout.drawRect(0, 0, 256, 256)
  Game.blackout.endFill()
  Game.blackout.alpha = 0
  // TODO
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
  // logic
  Game.queueLogic('movement')
  gameLoop()
}

PIXI.loader
  .add('assets/catman.png')
  .add('assets/data.json')
  .load(setup)
