const Entity = require('./entity.js')

module.exports = async (name) => {
  const room = Game.data.rooms.filter(room => room.name === name)[0]
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
  let t = 5
  room.perimeters.forEach(p => {
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