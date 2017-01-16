require('pixi.js')
const EventEmitter = require('events')
const Entity = require('./entity.js')
const Player = require('./player.js')
const Text = require('./text.js')
const keyboard = require('./keyboard.js')
const handleInteraction = require('./handle-interaction.js')

const globalEvents = new EventEmitter()

const renderer = PIXI.autoDetectRenderer(256, 256)

document.body.appendChild(renderer.view)

const stage = new PIXI.Container()

global.Game = {
  camera: {
    x: 0,
    y: 0,
    zoom: 1
  },
  data: null,
  interactionMode: 'movement',
  onUpdate: (fn) => globalEvents.on('update', fn),
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
  stage: stage
}

const loadRoom = (room) => {
  room.entities.forEach(entity => {
    let instance
    let def = Game.data.entities.filter(
      e => e.name === entity.name)[0]
    if (def.tags && def.tags.includes('player')) {
      instance = new Player(entity.name)
    } else {
      instance = new Entity(entity.name)
    }
    instance.setX(entity.x, true)
    instance.setY(entity.y, true)
    instance.setWidth(def.width, true)
    instance.setHeight(def.height)
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
    })
  })
}

const setup = () => {
  Game.data = PIXI.loader.resources['assets/data.json'].data
  const room = Game.data.rooms.filter(room => room.name === 'start')[0]
  loadRoom(room)

  // let catman = new Player(10, 10)
  // let fatman = new Entity(50, 50, 20, 20)
  // fatman.flavorText = [
  //   'a big blue square! wow',
  //   'though as you look closer',
  //   'it appears to be just a normal big cyan square instead'
  // ]

  Game.text = new Text()

  const keys = [{
    friendlyName: 'left arrow',
    keyCode: 37,
    onDown: () => Game.joy.x = -1,
    onUp: () => Game.joy.x = 0
  }, {
    friendlyName: 'up arrow',
    keyCode: 38,
    onDown: () => Game.joy.y = -1,
    onUp: () => Game.joy.y = 0
  }, {
    friendlyName: 'right arrow',
    keyCode: 39,
    onDown: () => Game.joy.x = 1,
    onUp: () => Game.joy.x = 0
  }, {
    friendlyName: 'down arrow',
    keyCode: 40,
    onDown: () => Game.joy.y = 1,
    onUp: () => Game.joy.y = 0
  }].reduce((prev, curr) => {
    prev[curr.keyCode] = {
      onDown: curr.onDown,
      onUp: curr.onUp
    }
    return prev
  }, {})

  window.addEventListener('keydown', (event) => {
    if (keys[event.keyCode]) {
      keys[event.keyCode].onDown()
    } else if (event.keyCode === 88) {
      // x
      handleInteraction();
    }
  })

  window.addEventListener('keyup', (event) => {
    if (keys[event.keyCode]) {
      keys[event.keyCode].onUp()
    }
  })

  const gameLoop = () => {
    renderer.render(stage)
    globalEvents.emit('update')
    requestAnimationFrame(gameLoop)
  }
  gameLoop()
}

PIXI.loader
  .add('assets/catman.png')
  .add('assets/data.json')
  .load(setup)
