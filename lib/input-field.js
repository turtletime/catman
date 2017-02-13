// Wait for an input field
// This is for level editor only

module.exports = class extends Action {
  async execute() {
    const textEntryForm = document.getElementById('editor-text-entry')
    if (!textEntryForm) {
      console.error('Input field area not found... can\t accept text entry.')
    }
    textEntryForm.innerHTML = ''
    const notice = await this.invoke('create-ui', '', {
      id: 'await-text-entry',
      anchor: { x: 0.5, y: 0.5 },
      position: { x: '50%', y: '50%' },
      size: {
        w: 100,
        h: 16
      },
      visible: true
    })
    notice.setText('enter text below')
    await new Promise(resolve => {
      textEntryForm.onkeydown = (event) => {
        const keyCode = event.keyCode
        if (keyCode === 13) {
          console.log(textEntryForm.innerHTML)
          textEntryForm.onkeydown = null
          resolve()
        }
      }
    })
    await this.invoke('destroy-ui', notice)
  }
}
