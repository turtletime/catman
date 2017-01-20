// Pictured: A boy who just learned about Promises + async/await
// and cannot wait to let the world know
module.exports = class extends Action {
  async execute(name) {
    const rom = this.state.rom
    const entities = this.state.scene.entities
    const room = rom.rooms.filter(room => room.name === name)[0]
    const normalize = (entity) => {
      let def = rom.entities.filter(e => e.name === entity.def)[0]
      let result = Object.assign({}, def, entity)
      result.asset = result.asset || result.name
      return result
    }
    await Promise.all(room.entities.map(async entity => {
      entity = normalize(entity)
      let instance = await this.invoke('create-entity', entity)
      entities.push(instance)
      if (instance.tags.includes('player')) {
        this.state.scene.player = instance
      }
    }))
    let t = 5
    await Promise.all(room.perimeters.map(async p => 
      await Promise.all([
        [ p.x, p.y - p.height / 2 - t / 2, p.width, t ],
        [ p.x - p.width / 2 - t / 2, p.y, t, p.height ],
        [ p.x + p.width / 2 + t / 2, p.y, t, p.height ],
        [ p.x, p.y + p.height / 2 + t / 2, p.width, t ]
      ].map(async bounds =>
        entities.push(await this.invoke('create-entity', {
          name: 'wall',
          x: bounds[0],
          y: bounds[1],
          width: bounds[2],
          height: bounds[3],
          onInteraction: {
            action: 'dialog',
            args: [
              "It's a wall.",
              "You can't get past it.",
              "Maybe with a certain power-up later in the game, though..."
            ]
          }
        }))
      ))
    ))
    await Promise.all(room.exits.map(async exit =>
      entities.push(await this.invoke('create-entity', {
        name: 'exit',
        x: exit.x,
        y: exit.y,
        width: exit.width,
        height: exit.height,
        data: { dest: exit.dest },
        tags: ['exit']
      }))
    ))
  }
}
