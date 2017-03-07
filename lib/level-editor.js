const LevelEditor = require('./react/level-editor.jsx')

module.exports = {
  'level-editor': async function () {
    await this.invoke('enable-footprints')
    ReactDOM.render(
      React.createElement(
        LevelEditor,
        { gameModule: this }
      ),
      document.getElementById('level-editor-supplement')
    )
    const joy = await this.invoke('create-joy')
    this.loop.schedule('camera-movement', () => {
      this.state.scene.camera.x -= joy.x * 2
      this.state.scene.camera.y -= joy.y * 2
      this.events.camera.emit('changed')
    })
    await this.invoke('wait-on-input', [
      {
        key: 'select',
        cb: () => false
      }
    ])
    this.loop.unschedule('camera-movement')
    await this.invoke('destroy-joy', joy)
    if (!previouslyEnabledFootprint) {
      await this.invoke('disable-footprints')
    }
  }
}