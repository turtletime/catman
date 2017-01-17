const Entity = require('./entity.js')

module.exports = async (name) => {
  const room = Game.data.rooms.filter(room => room.name === name)[0]
  let normalize = (entity) => {
    let def = Game.data.entities.filter(e => e.name === entity.def)[0]
    let result = Object.assign({}, def, entity)
    result.asset = result.asset || result.name
    return result
  }
  room.entities.forEach(entity => {
    let instance
    entity = normalize(entity)
    instance = new Entity(entity)
    if (instance.tags.includes('player')) {
      Game.player = instance
    }
  })
  let t = 5
  room.perimeters.forEach(p => {
    [
      [ p.x, p.y - p.height / 2 - t / 2, p.width, t ],
      [ p.x - p.width / 2 - t / 2, p.y, t, p.height ],
      [ p.x + p.width / 2 + t / 2, p.y, t, p.height ],
      [ p.x, p.y + p.height / 2 + t / 2, p.width, t ]
    ].forEach(bounds => {
      let instance = new Entity({
        name: 'wall',
        x: bounds[0],
        y: bounds[1],
        width: bounds[2],
        height: bounds[3],
        flavorText: [
          "It's a wall.",
          "You can't get past it.",
          "Maybe with a certain power-up later in the game, though..."
        ]
      })
    })
  })
  room.exits.forEach(exit => {
    new Entity({
      name: 'exit',
      x: exit.x,
      y: exit.y,
      width: exit.width,
      height: exit.height,
      data: { dest: exit.dest },
      tags: ['exit']
    })
  })
}