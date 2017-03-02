const extend = require('extend')
const inRectangle = require('../util/math-utils.js').inRectangle

const Perimeter = require('./perimeter.jsx')
const LevelEditorList = require('./level-editor-list.jsx')

module.exports = class PerimeterList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedPerimeter: null
    }
  }

  onCursorDown(x, y) {
    x = this.props.gameModule.state.scene.camera.toFieldX(x)
    y = this.props.gameModule.state.scene.camera.toFieldY(y)
    const foundPerimeter = this.props.gameModule.state.scene.perimeters.find((p) =>
      inRectangle(x, y, p.x, p.y, p.width, p.height))
    if (foundPerimeter) {
      this.setState(prevState => ({
        selectedPerimeter: foundPerimeter
      }))
    }
  }

  componentDidMount() {
    this.props.gameModule.state.Action.onCursorDown = this.onCursorDown.bind(this)
    this.props.gameModule.events.input.on('cursorDown', this.props.gameModule.state.Action.onCursorDown)
  }

  componentWillUnmount() {
    this.props.gameModule.events.input.removeListener('cursorDown', this.props.gameModule.state.Action.onCursorDown)
    delete this.props.gameModule.state.Action.onCursorDown
  }

  onEditPerimeter(indexString) {
    const index = indexString.split(' ')[0] // reverse engineer "0 [0, 5] x [0, 10]"
    const game = this.props.gameModule
    if (this.state.selectedPerimeter && game.state.scene.perimeters[index] === this.state.selectedPerimeter) {
      this.setState(prevState => Object.assign({}, prevState, {
        selectedPerimeter: null
      }))
    } else {
      this.setState(prevState => Object.assign({}, prevState, {
        selectedPerimeter: game.state.scene.perimeters[index]
      }))
    }
  }

  onPerimeterChanged(prop, value) {
    const newValue = parseInt(value)
    if (!isNaN(newValue)) {
      this.state.selectedPerimeter[prop] = newValue
      this.forceUpdate()
      return
    }
  }

  onAddPerimeter() {
    const perimeter = { x: 0, y: 0, width: 1, height: 1 }
    this.props.gameModule.state.scene.perimeters.push(perimeter)
    this.props.gameModule.invoke('create-ground', perimeter, 0xFFFFFF).then(() => {
      this.forceUpdate()
    })
  }

  onRemovePerimeter(index) {
    this.props.gameModule.state.scene.perimeters.splice(index, 1)
    this.forceUpdate()
  }

  render() {
    this.props.gameModule.state.scene.perimeters.forEach(perimeter => {
      const graphic = perimeter[Symbol.for('graphic')]
      if (perimeter !== this.state.selectedPerimeter) {
        graphic.color = 0xFFFFFF
        graphic[Symbol.for('changed')]()
      }
    })
    // draw last one on top
    if (this.state.selectedPerimeter) {
      const graphic = this.state.selectedPerimeter[Symbol.for('graphic')]
      graphic.color = 0xFFCC99
      graphic[Symbol.for('changed')]()
    }  
    return (
      <div>
        <LevelEditorList
          title={`Perimeters in room "${this.props.gameModule.state.scene.room}"`}
          id="perimeter-list"
          data={this.props.gameModule.state.scene.perimeters.map((perimeter, index) =>
            `${index} [${
              Math.round(perimeter.x - perimeter.width / 2)
            }, ${
              Math.round(perimeter.x + perimeter.width / 2)
            }] x [${
              Math.round(perimeter.y - perimeter.height / 2)
            }, ${
              Math.round(perimeter.y + perimeter.height / 2)
            }]`)
          }
          controls={{
            edit: { cb: this.onEditPerimeter.bind(this), color: 'blue' },
            remove: { cb: this.onRemovePerimeter.bind(this), color: 'red' }
          }}
        />[<a style={{ color: 'green' }} onClick={this.onAddPerimeter.bind(this)}>add perimeter</a>]
        {this.state.selectedPerimeter !== null && <Perimeter
          key={this.props.gameModule.state.scene.perimeters.findIndex(p => p === this.state.selectedPerimeter)} 
          data={this.state.selectedPerimeter}
          onChange={this.onPerimeterChanged.bind(this)}
        />}
      </div>
    )
  }
}