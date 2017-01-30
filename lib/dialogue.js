const _ = require('lodash')

const controlChars = {
  '#': 'label',
  '-': 'text',
  '>': 'response',
  '*': 'conditional',
  ':': 'comment',
  '!': 'logic'
}

// Turns dialogue into action tree

function parseDialogueText(text) {
  let lines = text.split('\n')
  // Lines that don't start with control characters
  // (#, -, >, *, :) get merged with the previous line.
  lines = lines.reduce((newLines, line) => {
    const matches = _.trim(line).match(/^[#*:>-]/)
    if (newLines.length > 0 && !matches) {
      newLines[newLines.length - 1].body += ` ${_.trim(line)}`
    } else {
      const newLine = {
        indent: _.trimEnd(line).length - _.trim(line).length,
        control: controlChars[matches[0]] || 'unknown',
        body: _.trim(_.trim(line).slice(1)),
        children: []
      }
      if (newLine.control === 'label') {
        newLine.indent = -1
      }
      newLines.push(newLine)
    }
    return newLines
  }, [])
  // As of right now, throw if conditional or unknown
  if (_.find(lines, line => line.control === 'conditional' || line.control === 'unknown')) {
    throw new Error('Unsupported control character')
  }
  const root = { indent: -2, children: [] }
  let current = [ root ]
  for (let i = 0; i < lines.length; i++) {
    while (_.last(current).indent >= lines[i].indent) {
      current.pop()
    }
    _.last(current).children.push(lines[i])
    current.push(lines[i])
  }
  lines.forEach(line => delete line.indent)
  return root.children
}

module.exports = {
  load: class extends Action {
    async execute(text) {
      this.rom.dialogue = parseDialogueText(text)
    }
  },

  run: class extends Action {
    async execute(label) {
      const rom = this.rom
      const dialogue = _.find(rom.dialogue, dialogue => dialogue.body === label)
      let activeSet = [].concat(dialogue.children)
      while (activeSet.length > 0) {
        let indexOfFirstPrompt = _.findIndex(activeSet, text => text.children.length > 0)
        if (indexOfFirstPrompt === -1) {
          // no prompts at all
          await this.invoke('dialog', {
            text: activeSet.map(child => child.body),
            responses: []
          })
          // clear entire active set
          activeSet = []
        } else {
          const result = await this.invoke('dialog', {
            text: activeSet.slice(0, indexOfFirstPrompt + 1).map(child => child.body),
            responses: activeSet[indexOfFirstPrompt].children.map(child => child.body)
          })
          // make new active set the next text based on result, suffixed with remaining lines in
          // activeSet that weren't used
          activeSet = [].concat(activeSet[indexOfFirstPrompt].children[result].children, activeSet.slice(indexOfFirstPrompt + 1))
        }
      }
    }
  }
}