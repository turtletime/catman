const extend = require('extend')
const inRectangle = require('../util/math-utils.js').inRectangle

const Perimeter = require('./perimeter.jsx')
const LevelEditorList = require('./level-editor-list.jsx')

const CURSOR_DOWN = Symbol('onCursorDown')
const CURSOR_MOVE = Symbol('onCursorMove')
const CURSOR_UP = Symbol('onCursorUp')

const getCorners = p => [
  { x: p.x - p.width / 2, y: p.y - p.height / 2 },
  { x: p.x + p.width / 2, y: p.y - p.height / 2 },
  { x: p.x + p.width / 2, y: p.y + p.height / 2 },
  { x: p.x - p.width / 2, y: p.y + p.height / 2 }
]

module.exports = class PerimeterList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedPerimeter: null
    }
    this.closestCorner = -1
    this.cursorOffset = { valid: false, x: 0, y: 0 }
    this[CURSOR_DOWN] = this.onCursorDown.bind(this)
    this[CURSOR_MOVE] = this.onCursorMove.bind(this)
    this[CURSOR_UP] = this.onCursorUp.bind(this)
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

  onCursorDown(x, y) {
    x = this.props.gameModule.state.scene.camera.toFieldX(x)
    y = this.props.gameModule.state.scene.camera.toFieldY(y)
    if (this.state.selectedPerimeter) {
      const corners = getCorners(this.state.selectedPerimeter)
      this.closestCorner = corners
        .map(corner => Math.abs(corner.x - x) + Math.abs(corner.y - y))
        .reduce(
          (prev, curr, index) => {
            if (curr < prev.value) {
              prev.value = curr
              prev.index = index
            }
            return prev
          }, { index: -1, value: 10 }
        ).index
      if (this.closestCorner !== -1) {
        this.cursorOffset.valid = true
        return
      }
    }
    const foundPerimeter = this.props.gameModule.state.scene.perimeters.find(p =>
      inRectangle(x, y, p.x, p.y, p.width, p.height))
    if (foundPerimeter) {
      this.cursorOffset.valid = true
      this.cursorOffset.x = foundPerimeter.x - x
      this.cursorOffset.y = foundPerimeter.y - y
      this.setState(prevState => ({
        selectedPerimeter: foundPerimeter,
        message: ''
      }))
    }
  }

  onCursorMove(x, y) {
    if (!this.cursorOffset.valid || !this.state.selectedPerimeter) {
      // console.log(x, y, this.cursorOffset.valid, this.state.selectedPerimeter)
      return
    }
    x = this.props.gameModule.state.scene.camera.toFieldX(x)
    y = this.props.gameModule.state.scene.camera.toFieldY(y)
    if (this.closestCorner == -1) {
      this.state.selectedPerimeter.x = this.cursorOffset.x + x
      this.state.selectedPerimeter.y = this.cursorOffset.y + y
    } else {
      // dragging a corner
      // keep the opposite corner in place
      const oppositeCorner = getCorners(this.state.selectedPerimeter)[(this.closestCorner + 2) % 4]
      // set position as middle and width/height accordingly
      this.state.selectedPerimeter.x = (x + oppositeCorner.x) / 2
      this.state.selectedPerimeter.y = (y + oppositeCorner.y) / 2
      this.state.selectedPerimeter.width = Math.abs(oppositeCorner.x - x)
      this.state.selectedPerimeter.height = Math.abs(oppositeCorner.y - y)
    }  
    this.forceUpdate()
  }

  onCursorUp(x, y) {
    this.cursorOffset.valid = false
    this.closestCorner = -1
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