const _ = require('lodash')

// Pictured: A boy who just learned about Promises + async/await
// and cannot wait to let the world know
module.exports = {
  load: class extends Action {
    async execute(roomName, playerSpawnLocation) {
      // set room name as scene.room
      this.state.scene.room = roomName
      const entities = this.state.scene.entities
      const room = this.rom.rooms.filter(room => room.name === roomName)[0]
      // set scene perimeters with JSON-copy
      this.state.scene.perimeters = JSON.parse(JSON.stringify(room.perimeters))
      await Promise.all(this.state.scene.perimeters.map(perimeter => this.invoke('create-ground', perimeter, 0xFFFFFF)))
      // load entities
      let spawnCoords
      await Promise.all(room.entities.map(async entity => {
        let instance = await this.invoke('hydrate-entity', entity)
        if (instance.name === playerSpawnLocation) {
          spawnCoords = { x: instance.position.x, y: instance.position.y }
        }
        entities.push(instance)
      }))
      if (playerSpawnLocation) {
        if (!this.state.player) {
          this.state.player = JSON.parse(JSON.stringify(this.rom.player))
        }
        this.state.scene.player = await this.invoke('hydrate-entity', this.state.player)
        this.state.scene.player.position.x = spawnCoords.x
        this.state.scene.player.position.y = spawnCoords.y
        entities.push(this.state.scene.player)
      }
    }
  },
  save: class extends Action {
    async execute() {
      const room = this.rom.rooms.filter(room => room.name === this.state.scene.room)[0]
      room.entities = await Promise.all(this.state.scene.entities.map(async entity => await this.invoke('serialize-entity', entity)))
      room.perimeters = this.state.scene.perimeters.map(perimeter => _.pick(perimeter, ['x', 'y', 'width', 'height']))
    }
  },
  clear: class extends Action {
    async execute() {
      // commit player's hydrated form in state
      if (this.state.scene.player) {
        this.state.player = await this.invoke('serialize-entity', this.state.scene.player)
      }
      // await Promise.all(this.state.scene.entities.forEach(entity => entity.destroy()))
      for (let i = 0; i < this.state.scene.entities.length; i++) {
        await this.invoke('destroy-entity', this.state.scene.entities[i])
      }
      this.state.scene.entities = []
      await Promise.all(this.state.scene.perimeters.map(perimeter => this.invoke('destroy-ground', perimeter)))
      this.state.scene.perimeters = []
      this.state.scene.player = null
    }
  }
}
