const Controller = require('./core/controller.js')

module.exports = class DialogController extends Controller {
  during(text) {
    if (typeof(text) === 'string') {
      text = [text]
    }
    return new Promise((resolve, reject) => {
      if (!this.state.scene.player) {
        resolve()
        return
      }

      const onDown = (keyCode) => {
        if (keyCode === 88) {
          if (!this.state.scene.text.advance()) {
            this.state.input.events.removeListener('down', onDown)
            resolve()
          }
        }
      }

      this.state.input.events.on('down', onDown)
      this.state.scene.text.reset(text)
    })
  }
}
