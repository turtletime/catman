

module.exports = class extends Action {
  execute(text) {
    if (typeof(text) === 'string') {
      text = [text]
    }
    return new Promise((resolve, reject) => {
      if (!this.state.scene.player) {
        resolve()
        return
      }

      const onDown = (keyCode) => {
        if (keyCode === this.constants.input.a) {
          if (!this.state.scene.text.advance()) {
            this.events.input.removeListener('down', onDown)
            resolve()
          }
        }
      }

      this.events.input.on('down', onDown)
      this.state.scene.text.reset(text)
    })
  }
}
