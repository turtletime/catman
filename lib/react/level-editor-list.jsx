const Griddle = require('griddle-react').default
const { RowDefinition, ColumnDefinition } = require('griddle-react')
const plugins = require('griddle-react').plugins

module.exports = class LevelEditorList extends React.Component {
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