// Pictured: A boy who just learned about Promises + async/await
// and cannot wait to let the world know
module.exports = {
  load: class extends Action {
    async execute(name) {
      this.state.scene.room = name
      const entities = this.state.scene.entities
      const room = this.rom.rooms.filter(room => room.name === name)[0]
      await Promise.all(room.entities.map(async entity => {
        let instance = await this.invoke('hydrate-entity', entity)
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
  },
  save: class extends Action {
    async execute() {
      const room = this.rom.rooms.filter(room => room.name === this.state.scene.room)[0]
      room.entities = await Promise.all(this.state.scene.entities.map(async entity => await this.invoke('serialize-entity', entity)))
    }
  },
  clear: class extends Action {
    async execute() {
      // await Promise.all(this.state.scene.entities.forEach(entity => entity.destroy()))
      for (let i = 0; i < this.state.scene.entities.length; i++) {
        await this.invoke('destroy-entity', this.state.scene.entities[i])
      }
      this.state.scene.entities = []
      this.state.scene.player = null
    }
  }
}
