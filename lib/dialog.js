const _ = require('lodash')

module.exports = class extends Action {
  async execute(dialog) {
    if (_.isArray(dialog)) {
      if (dialog.length === 0) {
        return
      }
      dialog = { text: dialog, responses: [] }
    } else if (_.isString(dialog)) {
      dialog = { text: [dialog], responses: [] }
    }
    if (_.isString(dialog.text)) {
      dialog.text = [dialog.text]
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
      size: { w: 64, h: 20 + dialog.responses.length * 14 },
      visible: false
    })
    const responseCursor = await this.invoke('create-ui', 'response', {
      id: 'response-cursor',
      anchor: { x: 0, y: 0 },
      position: { x: 8, y: 12 },
      size: { w: 8, h: 8 },
      visible: false
    })
    responseCursor.setText('')
    let index = 0
    let response = 0
    const updateUI = () => {
      if (index === dialog.text.length && dialog.responses.length > 0) {
        responseBox.visible = true
        responseCursor.visible = true
        // const maxLength = current.response.reduce((prev, curr) => prev = Math.max(prev, curr.length), 0)
        responseBox.setText(dialog.responses.map(response => `  ${response}`).join('\n'))
        responseBox.refresh()
        index++
      } else {
        textBox.setText(dialog.text[index++])
      }
    }
    updateUI()
    await this.invoke('wait-on-input', [
      {
        key: 'a',
        cb: () => {
          if (index < dialog.text.length || (index === dialog.text.length && dialog.responses.length > 0)) {
            updateUI()
            return false
          }
          return true
        }
      },
      {
        key: 'up',
        cb: () => {
          if (responseBox.visible) {
            response = (response + dialog.responses.length - 1) % dialog.responses.length
            responseCursor.position.y.pixel = 12 + response * 14
            responseCursor.refresh()
          }
          return false
        }
      },
      {
        key: 'down',
        cb: () => {
          if (responseBox.visible) {
            response = (response + 1) % dialog.responses.length
            responseCursor.position.y.pixel = 12 + response * 14
            responseCursor.refresh()
          }
          return false
        }
      },
    ])
    await this.invoke('destroy-ui', textBox)
    await this.invoke('destroy-ui', responseBox)
    if (dialog.responses.length > 0) {
      return response
    } else {
      return 0
    }
  }
}
