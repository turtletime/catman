const _ = require('lodash')

module.exports = class extends Action {
  async execute(text) {
    if (_.isArray(text) && text.length === 0) {
      return
    } else if (_.isString(text) || _.isPlainObject(text)) {
      text = [text]
    }
    const textBox = await this.invoke('create-ui', '', {
      id: 'text',
      anchor: { x: 0.5, y: 1 },
      position: { x: '50%', y: '100%-8px' },
      size: { w: '100%-16px', h: 64 }
    })
    const responseBox = await this.invoke('create-ui', '', {
      id: 'response',
      anchor: { x: 1, y: 1 },
      position: { x: '100%-8px', y: '100%-72px' },
      size: { w: 64, h: 64 },
      visible: false
    })
    let index = 0
    const updateUI = () => {
      const current = _.isPlainObject(text[index]) ? text[index] : { text: text[index] }
      textBox.setText(current.text)
      if (current.response) {
        responseBox.visible = true
        responseBox.size.h.pixel = 20 + current.response.length * 12
        const maxLength = current.response.reduce((prev, curr) => prev = Math.max(prev, curr.length), 0)
        responseBox.setText(current.response.join('\n'))
        responseBox.refresh()
      } else {
        responseBox.visible = false
        responseBox.setText('')
        responseBox.refresh()
      }
      index++
    }
    updateUI()
    await this.invoke('wait-on-input', [
      {
        key: 'a',
        cb: () => {
          if (text.length === index) {
            return true
          } else {
            updateUI()
            return false
          }
        }
      }
    ])
    await this.invoke('destroy-ui', textBox)
    await this.invoke('destroy-ui', responseBox)
  }
}
