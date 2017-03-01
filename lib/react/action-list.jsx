const InputField = require('./input-field.jsx')
const _ = require('lodash')

module.exports = class ActionList extends React.Component {
  onAddAction(actionIndex) {
    const copy = _.clone(this.props.value)
    copy.splice(actionIndex, 0, { action: '', args: [] })
    this.props.onChanged(this.props.id, copy)
  }

  onChangeAction() { }

  onRemoveAction(actionIndex) {
    const copy = _.clone(this.props.value)
    copy.splice(actionIndex, 1)
    this.props.onChanged(this.props.id, copy)
  }

  onAddArgument(actionIndex, argIndex) {
    const copy = _.clone(this.props.value)
    copy[actionIndex].args.splice(argIndex, 0, '')
    this.props.onChanged(this.props.id, copy)
  }

  onChangeArgument() { }

  onRemoveArgument(actionIndex, argIndex) {
    const copy = _.clone(this.props.value)
    copy[actionIndex].args.splice(argIndex, 0)
    this.props.onChanged(this.props.id, copy)
  }

  render() {
    return (
      <div>
        {this.props.title}:<br />
        <ol>
          {
            (() => {
              const actionsResult = this.props.value.map((action, actionIndex) => (
                <li>
                  <InputField
                    id={`${this.props.title}-${actionIndex}`}
                    width={100}
                    value={action.action}
                    onChange={this.onChangeAction.bind(this, actionIndex)}
                  />
                  [<a onClick={this.onAddAction.bind(this, actionIndex)} style={{ color: 'green' }}>insert action before</a>]
                  [<a onClick={this.onRemoveAction.bind(this, actionIndex)} style={{ color: 'red' }}>remove</a>]
                  <ul>
                    {
                      (() => {
                        if (!Array.isArray(action.args)) {
                          action.args = [action.args]
                        }
                        const argsResult = action.args.map((arg, argIndex) => (
                          <li>
                            <InputField
                              id={`${this.props.title}-${actionIndex}-${argIndex}`}
                              width={200}
                              value={arg}
                              onChange={this.onChangeArgument.bind(this, actionIndex, argIndex)}
                            />
                            [<a onClick={this.onAddArgument.bind(this, actionIndex, argIndex)} style={{ color: 'green' }}>insert arg before</a>]
                            [<a onClick={this.onRemoveArgument.bind(this, actionIndex, argIndex)} style={{ color: 'red' }}>remove</a>]
                          </li>
                        )).concat(
                          [<li>[<a onClick={this.onAddArgument.bind(this, actionIndex, action.args.length)} style={{ color: 'green' }}>add arg</a>]</li>]
                        )
                        return argsResult
                      })()
                    }
                  </ul>
                </li>
              )).concat(
                [<li>[<a onClick={this.onAddAction.bind(this, this.props.value.length)} style={{ color: 'green' }}>add action</a>]</li>]
              )
              return actionsResult
            })()
          }
        </ol>
      </div>
    )
  }
}