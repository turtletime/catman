const Typography = require('typography')
const Griddle = require('griddle-react').default
const plugins = require('griddle-react').plugins

new Typography().injectStyles()

class Rooms extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    console.log(this.props.data)
    return (
      <div>
        <Griddle
          data={this.props.data.map(room => ({ name: room.name }))}
          plugins={[plugins.LocalPlugin]}
        />
      </div>
    )
  }
}

module.exports = class extends Action {
  async execute() {
    
    ReactDOM.render(
      <Rooms data={this.rom.rooms} />,
      document.getElementById('level-editor-supplement')
    )
  }
}
