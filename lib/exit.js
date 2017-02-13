module.exports = class extends Action {
  async execute(destRoom, destEntity) {
    const currentRoom = this.state.scene.room
    await this.invoke('fade-out-transition', 0.5, 8)
    await this.invoke('clear-room')
    await this.invoke('load-room', destRoom, destEntity)
    await this.invoke('fade-in-transition', 0.5, 8)
  }
}