const Griddle = require('griddle-react').default
const { RowDefinition, ColumnDefinition } = require('griddle-react')
const plugins = require('griddle-react').plugins
const extend = require('extend')

const inRectangle = require('../util/math-utils.js').inRectangle
const _ = require('lodash')

const Entity = require('./entity.jsx')

class LevelEditorList extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id={this.props.id}>
        <h1>{this.props.title}</h1>
        <Griddle
          data={this.props.data.map(id => ({ name: id, actions: id }))}
          plugins={[plugins.LocalPlugin]}
        >
          <RowDefinition>
              <ColumnDefinition id="name" />
              <ColumnDefinition
                id="actions"
                customComponent={({value}) =>
                  <a>
                    {Object.keys(this.props.controls).map(key => (
                      <a key={key}>[
                        <a
                          onClick={() => this.props.controls[key].cb(value)}
                          style={{ color: this.props.controls[key].color || 'black' }}
                        >
                          {key}
                        </a>
                      ]</a>
                    ))}
                  </a>
                }
              />
          </RowDefinition>
        </Griddle>
      </div>
    )
  }
}

class LevelEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedRoom: null,
      selectedEntity: null,
      message: ''
    }
  }

  onCursorDown(x, y) {
    x = this.props.gameModule.state.scene.camera.toFieldX(x)
    y = this.props.gameModule.state.scene.camera.toFieldY(y)
    const foundEntity = this.props.gameModule.state.scene.entities.find((entity) =>
      inRectangle(x, y, entity.position.x, entity.position.y, entity.size.w, entity.size.h))
    if (foundEntity) {
      this.setState(prevState => ({
        selectedRoom: prevState.selectedRoom,
        selectedEntity: foundEntity,
        message: ''
      }))
    }
  }

  onEditRoom(roomName) {
    // Clear previous stuff
    if (this.props.gameModule.state.Action.onCursorDown) {
      this.props.gameModule.events.input.removeListener('cursorDown', this.props.gameModule.state.Action.onCursorDown)
      delete this.props.gameModule.state.Action.onCursorDown
    }
    let clear
    if (this.state.selectedRoom) {
      this.props.gameModule.invoke('save-room').then(() => this.props.gameModule.invoke('clear-room'))
    } else {
      clear = this.props.gameModule.invoke('clear-room')
    }
    clear.then(() => {
      //
      if (this.state.selectedRoom && roomName === this.state.selectedRoom.name) {
        this.setState({
          selectedRoom: null,
          selectedEntity: null,
          message: ''
        })
      } else {
        const that = this
        this.props.gameModule.invoke('load-room', roomName).then(() => {
          this.setState({
            selectedRoom: this.props.gameModule.rom.rooms.find(room => room.name === roomName),
            selectedEntity: null,
            message: ''
          })
          // make each entity clickable
          this.props.gameModule.state.Action.onCursorDown = this.onCursorDown.bind(this)
          this.props.gameModule.events.input.on('cursorDown', this.props.gameModule.state.Action.onCursorDown)
        })
      }
    })  
  }

  onEditEntity(entityName) {
    if (this.state.selectedEntity && entityName === this.state.selectedEntity.name) {
      this.setState({
        selectedRoom: this.state.selectedRoom,
        selectedEntity: null,
        message: ''
      })
    } else {
      this.setState({
        selectedRoom: this.state.selectedRoom,
        selectedEntity: this.props.gameModule.state.scene.entities.find(entity => entity.name === entityName),
        message: ''
      })
    }
  }

  onEntityChanged(prop, value) {
    // TODO Undeniable boilerplate here
    switch (prop) {
      case 'name':
        if (this.props.gameModule.state.scene.entities.find(
          entity => entity.name === value && entity !== this.state.selectedEntity
        )) {
          this.setState(prevState => ({
            selectedRoom: prevState.selectedRoom,
            selectedEntity: prevState.selectedEntity,
            message: 'Name collision'
          }))
        } else {
          this.state.selectedEntity.name = value
          this.setState(prevState => ({
            selectedRoom: prevState.selectedRoom,
            selectedEntity: prevState.selectedEntity,
            message: 'Updated'
          }))
        }
        return
        break
      case 'position-x':
      case 'position-y':
      case 'size-w':
      case 'size-h':  
        const newValue = parseInt(value)
        const fields = prop.split('-')
        if (!isNaN(newValue)) {
          this.state.selectedEntity[fields[0]][fields[1]] = newValue
          this.setState(prevState => ({
            selectedRoom: prevState.selectedRoom,
            selectedEntity: prevState.selectedEntity,
            message: 'Updated'
          }))
          return
        }
        break
      case 'tags':
        try {
          const newTags = JSON.parse(`{"value":${value}}`).value
          this.state.selectedEntity.tags = newTags
          this.setState(prevState => ({
            selectedRoom: prevState.selectedRoom,
            selectedEntity: prevState.selectedEntity,
            message: 'Updated'
          }))
          return
        } catch (e) { }
        break
      default:
        if (prop.startsWith('event-')) {
          const eventName = prop.split('-')[1]
          try {
            const newEvent = JSON.parse(`{"value":${value}}`).value
            this.state.selectedEntity.events[eventName] = newEvent
            this.setState(prevState => ({
              selectedRoom: prevState.selectedRoom,
              selectedEntity: prevState.selectedEntity,
              message: 'Updated'
            }))
            return
          } catch (e) { }
        }
        break  
    }
    this.props.gameModule.logger.warn(`${value}: Not a valid value for ${prop}`)
    this.setState(prevState => ({
      selectedRoom: prevState.selectedRoom,
      selectedEntity: prevState.selectedEntity,
      message: 'Updated'
    }))
  }

  onAddEntity(templateName) {
    if (!this.state.selectedRoom) {
      return
    } else {
      const game = this.props.gameModule
      const def = game.rom.entities.find(def => def.id === templateName)
      if (def) {
        game.invoke('create-entity',
          extend(true, {}, game.instantiate('entity'), def, {
            name: `${templateName}.${Date.now()}`,
            position: {
              x: game.state.scene.camera.toFieldX(game.state.graphics.dimensions.x / 2),
              y: game.state.scene.camera.toFieldY(game.state.graphics.dimensions.y / 2)
            }
          })).then(entity => {
            game.state.scene.entities.push(entity)
            this.forceUpdate()
          })
      } else {
        game.logger.error('Entry in template name doesn\'t exist in ROM')
      }
    }
  }

  onRemoveEntity(entityName) {
    const game = this.props.gameModule
    const entity = game.state.scene.entities.find(e => e.name === entityName)
    if (entity) {
      _.remove(game.state.scene.entities, e => e === entity)
      game.invoke('destroy-entity', entity)
      this.setState(prevState => ({
        selectedRoom: prevState.selectedRoom,
        selectedEntity: entity === prevState.selectedEntity ? null : prevState.selectedEntity,
        message: 'Deleted'
      }))
    } else {
      game.logger.error(`Entity ${entityName} not found`)
    }
  }

  onClickSave() {
    // commit to ROM
    this.props.gameModule.invoke('save-room').then(() => {
      const rom = Object.assign({}, this.props.gameModule.rom)
      delete rom.dialogue
      localStorage.setItem('data', JSON.stringify(rom, null, 2))
    }).then(() => {
      console.log('saved')
    })
  }

  render() {
    // stuff in-game
    this.props.gameModule.state.scene.entities.forEach(entity => {
      const footprint = entity[Symbol.for('footprint')]
      if (!footprint) {
        this.props.gameModule.logger.warn(`no footprint for ${entity.name}`)
      }
      if (entity === this.state.selectedEntity) {
        footprint.color = 0xFFCC66
      } else {
        footprint.color = 0x66CCFF
      }
      footprint[Symbol.for('changed')]()
    })
    if (this.state.selectedEntity && this.state.selectedEntity[Symbol.for('sprite')]) {
      this.state.selectedEntity[Symbol.for('sprite')][Symbol.for('changed')]()
    }
    return (
      <div id="level-editor" style={{ display: 'flex' }}>
        <div style={{ width: '50%' }}>
          <LevelEditorList
            title="Rooms"
            id="room-list"
            data={this.props.gameModule.rom.rooms.map(room => room.name)}
            controls={{
              edit: { cb: this.onEditRoom.bind(this), color: 'blue' }
            }}
          />
          {this.state.selectedRoom !== null && <LevelEditorList
            title={`Entities in room "${this.state.selectedRoom.name}"`}
            id="entity-list"
            data={this.props.gameModule.state.scene.entities.map(entity => entity.name)}
            controls={{
              edit: { cb: this.onEditEntity.bind(this), color: 'blue' },
              remove: { cb: this.onRemoveEntity.bind(this), color: 'red' }
            }}
          />}
          {this.state.selectedEntity !== null && <Entity
            data={this.state.selectedEntity}
            onChanged={this.onEntityChanged.bind(this)}
          />}
          <div id="level-editor-message" style={{ fontSize: 20 }}>{this.state.message}</div>
        </div>
        <div style={{ flexGrow: 1 }}>
          <button onClick={this.onClickSave.bind(this)}>"Save"</button>
          <LevelEditorList
            title="Templates"
            id="template-list"
            data={this.props.gameModule.rom.entities.map(entity => entity.id)}
            controls={{
              add: { cb: this.onAddEntity.bind(this), color: 'green' }
            }}
          />
        </div>
      </div>
    )
  }
}

module.exports = class extends Action {
  async execute() {
    const previouslyEnabledFootprint = !!this.state.footprint
    await this.invoke('enable-footprints')
    const roomName = this.state.scene.room
    await this.invoke('clear-room')
    await this.invoke('load-room', roomName)
    ReactDOM.render(
      <LevelEditor gameModule={this} />,
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
        cb: () => false // TODO Can't go back yet because state wasn't saved properly
      }
    ])
    this.loop.unschedule('camera-movement')
    await this.invoke('destroy-joy', joy)
    if (!previouslyEnabledFootprint) {
      await this.invoke('disable-footprints')
    }
  }
}
