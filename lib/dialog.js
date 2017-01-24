module.exports = class extends Action {
  async execute(text) {
    if (Array.isArray(text) && text.length === 0) {
      return
    } else if (typeof(text) === 'string') {
      text = [text]
    }
    let index = 0
    const textBox = await this.invoke('create-ui', '', {
      id: 'text',
      anchor: { x: 0.5, y: 1 },
      position: { x: '50%', y: '100%-8px' },
      size: { w: '100%-16px', h: 64 }
    })
    await new Promise((resolve, reject) => {
      const onDown = (keyCode) => {
        if (keyCode === this.constants.input.a) {
          index++
          if (text.length === index) {
            this.events.input.removeListener('down', onDown)
            textBox.destroy()
            resolve()
          } else {
            textBox.setText(text[index])
          }
        }
      }

      this.events.input.on('down', onDown)
      textBox.setText(text[index])
    })
  }
}
