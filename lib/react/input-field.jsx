let highWater = 0

module.exports = class InputField extends React.Component {
  constructor(props) {
    super(props)
    this.altDown = false
  }

  onKeyDown(event) {
    if (event.key === 'Alt') {
      this.altDown = true
    } else if (event.key === 'Enter') {
      if (!this.props.multiline || this.altDown) {
        this.props.onChanged(this.props.id, event.target.value)
      }
    }
  }

  onKeyUp(event) {
    if (event.key === 'Alt') {
      this.altDown = false
    }
  }

  render() {
    return this.props.multiline ? (
      <textarea
        id={this.props.id}
        key={highWater++}
        defaultValue={this.props.value}
        onKeyDown={this.onKeyDown.bind(this)}
        onKeyUp={this.onKeyUp.bind(this)}
      />
    ) : (
        <input
          id={this.props.id}
          key={highWater++}
          style={{ width: this.props.width }}
          type="text"
          defaultValue={this.props.value}
          onKeyDown={this.onKeyDown.bind(this)}
          onKeyUp={this.onKeyUp.bind(this)}
        />
    )
  }
}