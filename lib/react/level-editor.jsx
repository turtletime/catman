const _ = require('lodash')

const LevelEditorList = require('./level-editor-list.jsx')
const EntityList = require('./entity-list.jsx')
const PerimeterList = require('./perimeter-list.jsx')

class LevelEditor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedRoom: null,
      selectedPerimeter: null,
      message: ''
    }
  }

  onAddRoom() {
    this.props.gameModule.rom.rooms.push({
      name: `room.${Date.now()}`,
      entities: [],
      perimeters: []
    })
    this.setState(prevState => ({
      selectedRoom: prevState.selectedRoom,
      listing: '',
      selectedEntity: prevState.selectedEntity,
      selectedPerimeter: prevState.selectedPerimeter,
      message: 'Added new room'
    }))
  }

  onEditRoom(prop, roomName) {
    let clear
    if (this.state.selectedRoom) {
      clear = this.props.gameModule.invoke('save-room').then(() => this.props.gameModule.invoke('clear-room'))
    } else {
      clear = this.props.gameModule.invoke('clear-room')
    }
    clear.then(() => {
      //
      if (this.state.selectedRoom && roomName === this.state.selectedRoom.name) {
        this.setState({
          selectedRoom: null,
          selectedEntity: null,
          selectedPerimeter: null,
          message: ''
        })
      } else {
        const that = this
        this.props.gameModule.invoke('load-room', roomName).then(() => {
          this.setState({
            selectedRoom: this.props.gameModule.rom.rooms.find(room => room.name === roomName),
            listing: prop,
            selectedEntity: null,
            selectedPerimeter: null,
            message: ''
          })
        })
      }
    })  
  }

  onRenameRoom(roomName) {
    const newName = prompt('Enter new name:', '')
    if (this.props.gameModule.rom.rooms.find(room => room.name === newName && room.name !== roomName)) {
      this.setState(prevState => Object.assign({}, prevState, { message: 'Name collision' }))
    } else {
      const room = this.props.gameModule.rom.rooms.find(room => room.name === roomName)
      room.name = newName
      if (room === this.selectedRoom) {
        this.props.gameModule.state.scene.room = newName
      }
      this.setState(prevState => Object.assign({}, prevState, { message: 'Updated' }))
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
    return (
      <div id="level-editor" style={{ display: 'flex' }}>
        <div style={{ width: '100%' }}>
          <button onClick={this.onClickSave.bind(this)}>"Save"</button>
          <LevelEditorList
            title="Rooms"
            id="room-list"
            data={this.props.gameModule.rom.rooms.map(room => room.name)}
            controls={{
              'edit entities': { cb: this.onEditRoom.bind(this, 'entities'), color: 'blue' },
              'edit perimeters': { cb: this.onEditRoom.bind(this, 'perimeters'), color: 'blue' },
              rename: { cb: this.onRenameRoom.bind(this), color: 'orange' }
            }}
          />
          [<a style={{ color: 'green' }} onClick={this.onAddRoom.bind(this)}>add room</a>]
          {this.state.selectedRoom !== null && this.state.listing === 'entities' && <EntityList
            gameModule={this.props.gameModule}
          />}
          {this.state.selectedRoom !== null && this.state.listing === 'perimeters' && <PerimeterList
            gameModule={this.props.gameModule}  
          />}
          <div id="level-editor-message" style={{ fontSize: 20 }}>{this.state.message}</div>
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
