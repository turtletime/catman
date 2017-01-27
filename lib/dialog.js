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
    textBox.setText(text[index])
    await this.invoke('wait-on-input', [
      {
        key: 'a',
        cb: () => {
          index++
          if (text.length === index) {
            return true
          } else {
            textBox.setText(text[index])
            return false
          }
        }
      }
    ])
    await this.invoke('destroy-ui', textBox)
  }
}
