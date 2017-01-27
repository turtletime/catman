const _ = require('lodash')

module.exports = class extends Action {
  async execute() {
    const joy = await this.invoke('create-joy')
    let ui = await this.invoke('create-ui', '', {
      id: 'level-editor-notice',
      text: 'level editor',
      anchor: { x: 0, y: 1 },
      position: { x: 8, y: '100%-8px' },
      size: { w: 110, h: 32 }
    })
    setTimeout(() => {
      this.invoke('destroy-ui', ui)
      ui = null
    }, 1000)
    this.loop.schedule('move-camera', () => {
      if (joy.x !== 0 || joy.y !== 0) {
        this.state.scene.camera.x -= joy.x
        this.state.scene.camera.y -= joy.y
        this.events.camera.emit('changed')
      }
    })
    let entityIndex = 0
    while (true) {
      const def = this.rom.entities[entityIndex]
      const entity = await this.invoke('create-entity',
        Object.assign({}, def, {
          asset: def.id || def.asset,
          onInteraction: {
            action: 'dialog',
            args: `This ${def.id} was placed here by a higher power.`
          }
        }))
      const onCursorMove = (x, y) => {
        entity.x = this.state.scene.camera.toFieldX(x)
        entity.y = this.state.scene.camera.toFieldY(y)
        entity.onUpdate()
        this.events.game.emit('changed', entity)
      }
      onCursorMove(this.state.input.x, this.state.input.y)
      this.events.input.on('cursorMove', onCursorMove)
      let result = ''
      await this.invoke('wait-on-input', [
        {
          key: 'l',
          cb: () => {
            entityIndex = (entityIndex + this.rom.entities.length - 1) % this.rom.entities.length
            return true
          }
        },
        {
          key: 'r',
          cb: () => {
            entityIndex = (entityIndex + 1) % this.rom.entities.length
            return true
          }
        },
        {
          key: 'select',
          cb: () => {
            result = 'exit'
            return true
          }
        },
        {
          mouse: 'primary',
          cb: (x, y) => {
            this.state.scene.entities.push(entity)
            result = 'created'
            return true
          }
        },
        {
          key: 'start',
          cb: () => {
            result = 'save'
            return true
          }
        }
      ])
      this.events.input.removeListener('cursorMove', onCursorMove)
      // process exit
      if (result !== 'created') {
        await this.invoke('destroy-entity', entity)
      }
      if (result === 'save') {
        await this.invoke('save-room')
        localStorage.setItem('data', JSON.stringify(this.rom, null, 2))
        if (ui) {
          await this.invoke('destroy-ui', ui)
        }
        ui = await this.invoke('create-ui', '', {
          id: 'save-notice',
          text: 'saved',
          anchor: { x: 0, y: 1 },
          position: { x: 8, y: '100%-8px' },
          size: { w: 80, h: 32 }
        })
        setTimeout(() => {
          this.invoke('destroy-ui', ui)
          ui = null
        }, 1000)
      }
      if (result === 'exit') {
        break;
      }
    }
    this.loop.unschedule('move-camera')
    if (ui) {
      await this.invoke('destroy-ui', ui)
    }
    ui = await this.invoke('create-ui', '', {
      id: 'game-notice',
      text: 'game active',
      anchor: { x: 0, y: 1 },
      position: { x: 8, y: '100%-8px' },
      size: { w: 110, h: 32 }
    })
    setTimeout(this.invoke.bind(this, 'destroy-ui', ui), 1000)
    await this.invoke('destroy-joy', joy)
  }
}