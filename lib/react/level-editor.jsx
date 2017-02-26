// const Typography = require('typography')
const Griddle = require('griddle-react').default
const { RowDefinition, ColumnDefinition } = require('griddle-react')
const plugins = require('griddle-react').plugins

// new Typography().injectStyles()

class Entity extends React.Component {
  render() {
    const entity = this.props.data
    const displayEvents = Object.create({}, {
        interact: [],
        collide: []
      },
      entity.events || {}
    )
    return (
      <div>
        <h1>{`Entity ${entity.name}`}</h1>
        <ul>
          <li><b>Name: </b>{entity.name}</li>
          <li><b>Position: </b>{entity.position.x}, {entity.position.y}</li>
          <li><b>Tags: </b>{entity.tags ? entity.tags.join(', ') : ''}</li>
          <li><b>Events: </b></li>
          <ul>
            <li>Collide: {JSON.stringify(displayEvents.collide)}</li>
            <li>Interact: {JSON.stringify(displayEvents.interact)}</li>
          </ul>
        </ul>
      </div>
    )
  }
}

class LevelEditorList extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div id={this.props.id}>
        <h1>{this.props.title}</h1>
        <Griddle
          data={this.props.data.map((room, index) => ({ id: index, name: room.name })) }
          plugins={[plugins.LocalPlugin]}
        >
          <RowDefinition>
            <ColumnDefinition id="id" />
            <ColumnDefinition id="name" customComponent={({value}) =>
              <a onClick={() => this.props.onClickName(value)}>{value}</a>}
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
      selectedEntity: null
    }
  }

  onClickRoomName(roomName) {
    if (this.state.selectedRoom && roomName === this.state.selectedRoom.name) {
      this.props.gameModule.invoke('clear-room')
      this.setState({
        selectedRoom: null,
        selectedEntity: null
      })
    } else {
      this.props.gameModule.invoke('clear-room').then(() => {
        this.props.gameModule.invoke('load-room', roomName)
      }).then(() => {

      })
      this.setState({
        selectedRoom: this.props.data.rooms.find(room => room.name === roomName),
        selectedEntity: null
      })
    }
  }

  onClickEntityName(entityName) {
    if (this.state.selectedEntity && entityName === this.state.selectedEntity.name) {
      this.setState({
        selectedRoom: this.state.selectedRoom,
        selectedEntity: null
      })
    } else {
      this.setState({
        selectedRoom: this.state.selectedRoom,
        selectedEntity: this.state.selectedRoom.entities.find(entity => entity.name === entityName)
      })
    }
  }

  render() {
    return (
      <div id="level-editor">
        <LevelEditorList
          title="Rooms"
          id="room-list"
          data={this.props.data.rooms}
          onClickName={this.onClickRoomName.bind(this)}
        />
        {this.state.selectedRoom !== null && <LevelEditorList
          title={`Entities in room "${this.state.selectedRoom.name}"`}
          id="entity-list"
          data={this.state.selectedRoom.entities}
          onClickName={this.onClickEntityName.bind(this)}
        />}
        {this.state.selectedEntity !== null && <Entity
          data={this.state.selectedEntity}
        />}
      </div>
    )
  }
}

module.exports = class extends Action {
  async execute() {
    const previouslyEnabledFootprint = !!this.state.footprint
    await this.invoke('enable-footprints')
    await this.invoke('clear-room')
    ReactDOM.render(
      <LevelEditor data={this.rom} gameModule={this} />,
      document.getElementById('level-editor-supplement')
    )
    await this.invoke('wait-on-input', [
      {
        key: 'select',
        cb: () => true
      }
    ])
    if (!previouslyEnabledFootprint) {
      await this.invoke('disable-footprints')
    }
  }
}
