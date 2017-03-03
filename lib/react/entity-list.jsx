const extend = require('extend')
const inRectangle = require('../util/math-utils.js').inRectangle

const Entity = require('./entity.jsx')
const LevelEditorList = require('./level-editor-list.jsx')

const CURSOR_DOWN = Symbol('onCursorDown')
const CURSOR_MOVE = Symbol('onCursorMove')
const CURSOR_UP = Symbol('onCursorUp')

module.exports = class EntityList extends React.Component {
  constructor(props) {
    super(props)
    this.cursorOffset = { valid: false, x: 0, y: 0 }
    this.state = {
      selectedEntity: null,
      message: '' //TODO remove
    }
    this[CURSOR_DOWN] = this.onCursorDown.bind(this)
    this[CURSOR_MOVE] = this.onCursorMove.bind(this)
    this[CURSOR_UP] = this.onCursorUp.bind(this)
  }

  onCursorDown(x, y) {
    x = this.props.gameModule.state.scene.camera.toFieldX(x)
    y = this.props.gameModule.state.scene.camera.toFieldY(y)
    const foundEntity = this.props.gameModule.state.scene.entities.find((entity) =>
      inRectangle(x, y, entity.position.x, entity.position.y, entity.size.w, entity.size.h))
    if (foundEntity) {
      this.cursorOffset.valid = true
      this.cursorOffset.x = foundEntity.position.x - x
      this.cursorOffset.y = foundEntity.position.y - y
      this.setState(prevState => ({
        selectedEntity: foundEntity,
        message: ''
      }))
    }
  }

  onCursorMove(x, y) {
    if (!this.cursorOffset.valid || !this.state.selectedEntity) {
      return
    }
    x = this.props.gameModule.state.scene.camera.toFieldX(x)
    y = this.props.gameModule.state.scene.camera.toFieldY(y)
    this.state.selectedEntity.position.x = this.cursorOffset.x + x
    this.state.selectedEntity.position.y = this.cursorOffset.y + y
    this.forceUpdate()
  }

  onCursorUp(x, y) {
    this.cursorOffset.valid = false
  }

  componentDidMount() {
    this.props.gameModule.events.input.on('cursorDown', this[CURSOR_DOWN])
    this.props.gameModule.events.input.on('cursorMove', this[CURSOR_MOVE])
    this.props.gameModule.events.input.on('cursorUp', this[CURSOR_UP])
  }

  componentWillUnmount() {
    this.props.gameModule.events.input.removeListener('cursorDown', this[CURSOR_DOWN])
    this.props.gameModule.events.input.removeListener('cursorMove', this[CURSOR_MOVE])
    this.props.gameModule.events.input.removeListener('cursorUp', this[CURSOR_UP])
  }

  onEditEntity(entityName) {
    if (this.state.selectedEntity && entityName === this.state.selectedEntity.name) {
      this.setState(prevState => Object.assign({}, prevState, {
        selectedEntity: null,
        message: ''
      }))
    } else {
      this.setState(prevState => Object.assign({}, prevState, {
        selectedEntity: this.props.gameModule.state.scene.entities.find(entity => entity.name === entityName),
        message: ''
      }))
    }
  }

  onEntityChanged(prop, value) {
    switch (prop) {
      case 'name':
        if (this.props.gameModule.state.scene.entities.find(
          entity => entity.name === value && entity !== this.state.selectedEntity
        )) {
          this.setState(prevState => Object.assign({}, prevState, { message: 'Name collision' }))
        } else {
          this.state.selectedEntity.name = value
          this.setState(prevState => Object.assign({}, prevState, { message: 'Updated' }))
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
          this.setState(prevState => Object.assign({}, prevState, { message: 'Updated' }))
          return
        }
        break
      case 'tags':
        try {
          const newTags = JSON.parse(`{"value":${value}}`).value
          this.state.selectedEntity.tags = newTags
          this.setState(prevState => Object.assign({}, prevState, { message: 'Updated' }))
          return
        } catch (e) { }
        break
      default:
        if (prop.startsWith('event-')) {
          const eventName = prop.split('-')[1]
          try {
            this.state.selectedEntity.events[eventName] = value
            this.setState(prevState => Object.assign({}, prevState, { message: 'Updated' }))
            return
          } catch (e) { }
        }
        break  
    }
    this.setState(prevState => Object.assign({}, prevState, { message: `${value}: Not a valid value for ${prop}` }))
  }

  onAddEntity(templateName) {
    const game = this.props.gameModule
    const def = game.rom.entities.find(def => def.id === templateName)
    game.invoke('create-entity',
      extend(true, {}, game.instantiate('entity'), def || {}, {
        name: `${templateName}.${Date.now()}`,
        position: {
          x: game.state.scene.camera.toFieldX(game.state.graphics.dimensions.x / 2),
          y: game.state.scene.camera.toFieldY(game.state.graphics.dimensions.y / 2)
        }
      })).then(entity => {
        game.state.scene.entities.push(entity)
        this.setState(prevState => Object.assign({}, prevState, { message: 'Added entity' }))
      })
  }

  onRemoveEntity(entityName) {
    const game = this.props.gameModule
    const entity = game.state.scene.entities.find(e => e.name === entityName)
    if (entity) {
      _.remove(game.state.scene.entities, e => e === entity)
      game.invoke('destroy-entity', entity)
      this.setState(prevState => Object.assign({}, prevState, {
        selectedEntity: entity === prevState.selectedEntity ? null : prevState.selectedEntity,
        message: 'Deleted'
      }))
    } else {
      game.logger.error(`Entity ${entityName} not found`)
    }
  }

  render() {
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
    return (
      <div style={{ display: 'flex' }}>
        <div style={{ width: '50%' }}>
          <LevelEditorList
            title={`Entities in room "${this.props.gameModule.state.scene.room}"`}
            id="entity-list"
            data={this.props.gameModule.state.scene.entities.map(entity => entity.name)}
            controls={{
              edit: { cb: this.onEditEntity.bind(this), color: 'blue' },
              remove: { cb: this.onRemoveEntity.bind(this), color: 'red' }
            }}
          />
          [<a style={{ color: 'green' }} onClick={this.onAddEntity.bind(this, 'empty')}>add empty entity</a>]
          {this.state.selectedEntity !== null && <Entity
            key={`${this.state.selectedEntity.name}-${this.state.selectedEntity.x}-${this.state.selectedEntity.y}`}
            data={this.state.selectedEntity}
            onChange={this.onEntityChanged.bind(this)}
          />}
        </div>
        <div style={{ flexGrow: 1 }}>
          <LevelEditorList
            title="Templates"
            id="template-list"
            data={this.props.gameModule.rom.entities.map(entity => entity.id)}
            controls={{
              'add to room': { cb: this.onAddEntity.bind(this), color: 'green' }
            }}
          />
        </div>
      </div>
    )
  }
}
