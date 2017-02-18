let roomNo = 0

module.exports = class extends Action {
  async execute() {
    let ui = await this.invoke('create-ui', '', {
      id: `room-card-${roomNo++}`,
      text: this.state.scene.room,
      anchor: { x: 0, y: 1 },
      position: { x: 8, y: '100%-8px' },
      size: { w: 110, h: 32 }
    })
    setTimeout(() => {
      this.invoke('destroy-ui', ui)
      ui = null
    }, 1000)
  }
}