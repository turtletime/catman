module.exports = class extends Action {
  async execute(dx, dy) {
    if (!dx && !dy) {
      return
    }
    let { x: destX, y: destY } = this.state.scene.player.position
    destX += dx
    destY += dy
    let distance = Math.sqrt(dx * dx + dy * dy)
    // dx and dy now are a normalized vector
    dx /= distance
    dy /= distance
    await new Promise(resolve => {
      this.loop.schedule('auto-movement', () => {
        this.state.scene.player.onUpdate()
        let { x: currX, y: currY } = this.state.scene.player.position
        let distanceRemaining = Math.sqrt(
          (destX - currX) * (destX - currX) +
          (destY - currY) * (destY - currY))
        if (distanceRemaining <= 0.01) { //eps
          this.loop.unschedule('auto-movement')
          resolve()
        }
        let distanceToCover = Math.min(this.constants.PLAYER_SPEED, distanceRemaining)
        this.state.scene.player.velocity.x = distanceToCover * dx
        this.state.scene.player.velocity.y = distanceToCover * dy
      })
    })
  }
}