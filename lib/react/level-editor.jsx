const _ = require('lodash')

const LevelEditorList = require('./level-editor-list.jsx')
const EntityList = require('./entity-list.jsx')
const PerimeterList = require('./perimeter-list.jsx')

module.exports = class extends React.Component {
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
    let clear = Promise.resolve()
    if (this.state.selectedRoom) {
      clear = this.props.gameModule.invoke('save-room').then(() => this.props.gameModule.invoke('clear-room'))
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
