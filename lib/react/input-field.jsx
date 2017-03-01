let highWater = 0

module.exports = class InputField extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      color: 'white'
    }
    // TODO maybe remove this  
    this.altDown = false
  }

  onKeyDown(event) {
    if (event.key === 'Alt') {
      this.altDown = true
    } else if (event.key === 'Enter') {
      this.setState({
        color: 'white'
      })
      if (!this.props.requireAlt || this.altDown) {
        this.props.onChange(this.props.id, event.target.value)
      }
    } else if (/^[ -~]$/.test(event.key)) {
      this.setState({
        color: 'pink'
      })
    }
  }

  onKeyUp(event) {
    if (event.key === 'Alt') {
      this.altDown = false
    }
  }

  render() {
    return (
      <input
        id={this.props.id}
        style={{ width: this.props.width }}
        type="text"
        defaultValue={this.props.value}
        onKeyDown={this.onKeyDown.bind(this)}
        onKeyUp={this.onKeyUp.bind(this)}
        style={{ backgroundColor: this.state.color }}
      />
    )
  }
}