// triggers: list of conditions for resolution
// of the form { device, action, cb }
module.exports = class extends Action {
  async execute(triggers) {
    const onMouseDownActions = triggers.filter(trigger => !!trigger.mouse)
    const onKeyDownActions = triggers.filter(trigger => !!trigger.key)
    // const onMouseDownActions = triggers.filter(trigger => trigger.device === 'mouse' && trigger.action === 'down')
    // const onKeyDownActions = triggers.filter(trigger => trigger.device === 'key' && trigger.action === 'down')
    // const onMouseUpActions = triggers.filter(trigger => trigger.device === 'mouse' && trigger.action === 'up')
    // const onKeyUpActions = triggers.filter(trigger => trigger.device === 'key' && trigger.action === 'up')
    let onMouseDown
    let onKeyDown
    await new Promise(resolve => {
      if (onMouseDownActions) {
        onMouseDown = (x, y) => {
          if (onMouseDownActions.find(trigger => trigger.cb(x, y))) {
            resolve()
          }
        }
        this.events.input.on('cursorDown', onMouseDown)
      }
      if (onKeyDownActions) {
        onKeyDown = (keyCode) => {
          if (onKeyDownActions.find(trigger => this.constants.input[trigger.key] === keyCode && trigger.cb())) {
            resolve()
          }
        }
        this.events.input.on('keyDown', onKeyDown)
      }
    })
    if (onMouseDown) {
      this.events.input.removeListener('cursorDown', onMouseDown)
    }
    if (onKeyDown) {
      this.events.input.removeListener('keyDown', onKeyDown)
    }
  }
}