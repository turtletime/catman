// Pictured: A boy who just learned about Promises + async/await
// and cannot wait to let the world know
module.exports = {
  load: class extends Action {
    async execute(name) {
      this.state.scene.room = name
      const entities = this.state.scene.entities
      const room = this.rom.rooms.filter(room => room.name === name)[0]
      this.state.scene.perimeters = JSON.parse(JSON.stringify(room.perimeters))
      await this.invoke('create-ground', 0xFFFFFF)
      await Promise.all(room.entities.map(async entity => {
        let instance = await this.invoke('hydrate-entity', entity)
        entities.push(instance)
        if (instance.tags.includes('player')) {
          this.state.scene.player = instance
        }
      }))
      let t = 5
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
      await this.invoke('destroy-ground')
      this.state.scene.perimeters = []
      this.state.scene.player = null
    }
  }
}
