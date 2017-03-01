module.exports = {
  'create-joy': async function() {
    const joy = { x: 0, y: 0 }
    const keys = {
      [this.constants.input.left]: {
        onDown: () => joy.x = -1,
        onUp: () => joy.x = 0
      },
      [this.constants.input.up]: {
        onDown: () => joy.y = -1,
        onUp: () => joy.y = 0
      },
      [this.constants.input.right]: {
        onDown: () => joy.x = 1,
        onUp: () => joy.x = 0
      },
      [this.constants.input.down]: {
        onDown: () => joy.y = 1,
        onUp: () => joy.y = 0
      }
    }
    const onDown = (keyCode) => {
      if (keys[keyCode]) {
        keys[keyCode].onDown()
      }
    }
    const onUp = (keyCode) => {
      if (keys[keyCode]) {
        keys[keyCode].onUp()
      }
    }
    this.events.input.on('keyDown', onDown)
    this.events.input.on('keyUp', onUp)
    joy.destroy = () => {
      this.events.input.removeListener('keyDown', onDown)
      this.events.input.removeListener('keyUp', onUp)
    }
    return joy
  },
  'destroy-joy': async function(joy) {
    joy.x = joy.y = 0
    joy.destroy()
  }
}