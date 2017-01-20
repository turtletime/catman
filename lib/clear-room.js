

module.exports = class extends Action {
  async execute() {
    // await Promise.all(this.state.scene.entities.forEach(entity => entity.destroy()))
    for (let i = 0; i < this.state.scene.entities.length; i++) {
      this.state.scene.entities[i].destroy()
    }
    this.state.scene.entities = []
    this.state.scene.player = null
  }
}