const InputField = require('./input-field.jsx')

module.exports = class Perimeter extends React.Component {
  render() {
    const perimeter = this.props.data
    return (
      <div>
        <h1>{`Perimeter`}</h1>
        <ul>
          <li><b>Position: </b>
            <InputField
              id="x"
              value={perimeter.x}
              onChange={this.props.onChange}
              width={25}
            />,
            <InputField
              id="y"
              value={perimeter.y}
              onChange={this.props.onChange}
              width={25}
            />
          </li>
          <li><b>Size: </b>
            <InputField
              id="width"
              value={perimeter.width}
              onChange={this.props.onChange}
              width={25}
            />,
            <InputField
              id="height"
              value={perimeter.height}
              onChange={this.props.onChange}
              width={25}
            />
          </li>
        </ul>
      </div>
    )
  }
}