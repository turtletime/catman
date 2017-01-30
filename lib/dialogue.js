const _ = require('lodash')

const controlChars = {
  '#': 'label',
  '-': 'text',
  '>': 'response',
  '!': 'conditional',
  ':': 'comment',
  '*': 'action'
}

// Turns dialogue into action tree

function parseDialogueText(text) {
  let lines = text.split('\n')
  // Lines that don't start with control characters
  // (#, -, >, *, :, !) get merged with the previous line.
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
      newLines.push(newLine)
    }
    return newLines
  }, []).map(line => { // post-merge logic here.
    if (line.control === 'label') {
      line.indent = -1
    }
    if (line.control === 'action') {
      // Courtesy of http://stackoverflow.com/a/40120309
      const matches = line.body.match(/(?=\S)[^"\s]*(?:"[^\\"]*(?:\\[\s\S][^\\"]*)*"[^"\s]*)*/g)
      line.body = {
        action: matches[0],
        args: matches.slice(1)
      }
    }
    return line
  })
  // As of right now, throw if conditional or unknown
  if (_.find(lines, line => line.control === 'conditional' || line.control === 'unknown')) {
    throw new Error('Unsupported control character')
  }
  const root = { indent: -2, children: [] }
  let current = [ root ]
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].control === 'comment') {
      continue
    }
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
        while (activeSet.length > 0 && activeSet[0].control === 'action') {
          // TODO: Stack grows with recursive invocations
          await this.invokeFromObject(activeSet[0].body)
          activeSet = activeSet.slice(1)
        }
        if (activeSet.length === 0) {
          break
        }
        let numConsecutiveTexts = _.findIndex(activeSet, node => node.control === 'text' && node.children.length > 0) + 1 || activeSet.length
        numConsecutiveTexts = Math.min((_.findIndex(activeSet, node => node.control === 'action') + 1 || activeSet.length + 1) - 1, numConsecutiveTexts)
        const result = await this.invoke('dialog', {
          text: activeSet.slice(0, numConsecutiveTexts).map(child => child.body),
          responses: activeSet[numConsecutiveTexts - 1].children.map(child => child.body)
        })
        if (activeSet[numConsecutiveTexts - 1].children.length === 0) {
          activeSet = [].concat(activeSet.slice(numConsecutiveTexts))
        } else {
          activeSet = [].concat(activeSet[numConsecutiveTexts - 1].children[result].children, activeSet.slice(numConsecutiveTexts))
        }
      }
    }
  }
}