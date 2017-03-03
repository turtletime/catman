const InputField = require('./input-field.jsx')
const ActionList = require('./action-list.jsx')

module.exports = class Entity extends React.Component {
  render() {
    const entity = this.props.data
    const displayEvents = {
      interact: entity.events.interact || [],
      collide: entity.events.collide || []
    }
    return (
      <div>
        <h1>{`Entity ${entity.name}`}</h1>
        <ul>
          <li><b>Name: </b><InputField
            id="name"
            type="text"
            value={entity.name}
            onChange={this.props.onChange}
            width={100}
          /></li>
          <li><b>Position: </b>
            <InputField
              id="position-x"
              key={'x' + entity.position.x}
              value={entity.position.x}
              onChange={this.props.onChange}
              width={25}
            />,
            <InputField
              id="position-y"
              key={'y' + entity.position.y}
              value={entity.position.y}
              onChange={this.props.onChange}
              width={25}
            />
          </li>
          <li><b>Size: </b>
            <InputField
              id="size-w"
              value={entity.size.w}
              onChange={this.props.onChange}
              width={25}
            />,
            <InputField
              id="size-h"
              value={entity.size.h}
              onChange={this.props.onChange}
              width={25}
            />
          </li>
          <li><b>Tags: </b><InputField
            id="tags"
            value={JSON.stringify(entity.tags, null, 2)}
            onChange={this.props.onChange}
            width={100}
          /></li>
          <li><b>Events:</b></li>
          <ul>
            {Object.keys(displayEvents).map(key => {
              return (<li key={key}><ActionList
                title={key}
                id={`event-${key}`}
                value={displayEvents[key]}
                onChange={this.props.onChange}
              /></li>)
            })}
          </ul>
        </ul>
      </div>
    )
  }
}