const _ = require('lodash')

const controlChars = {
  '#': 'label',
  '-': 'text',
  '>': 'response',
  '!': 'conditional',
  ':': 'comment',
  '*': 'action'
}

const comparators = {
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '>': (a, b) => a > b,
  '>=': (a, b) => a >= b,
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b
}

function toInvokeObject(expr) {
  // Courtesy of http://stackoverflow.com/a/40120309
  const matches = expr.match(/(?=\S)[^"\s]*(?:"[^\\"]*(?:\\[\s\S][^\\"]*)*"[^"\s]*)*/g)
  if (!matches) {
    this.logger.error('invoked object couldn\'t be parsed')
    return {}
  } else if (matches.length === 1) {
    return { action: matches[0] }
  }
  return {
    action: matches[0],
    args: matches.slice(1)
  }
}

function createEvalTree(matches) {
  function parseExpr(expr) {
    if (expr.match(/^"\[.*\]"$/)) {
      return toInvokeObject(expr.substring(2, expr.length - 2))
    } else if (expr === 'NaN') {
      return NaN
    }
    const result = parseFloat(expr)
    if (result !== NaN) {
      return result
    }
    return expr
  }

  // for now, only a single comparison is supported.
  // TODO: Make this more flexible.
  if (matches.length === 0) {
    return { value: true }
  }
  if (matches.length !== 3) {
    this.logger.warn('parse dialogue: condition not supported')
    return
  }
  if (!matches[1].match(/^(==|!=|>|>=|<|<=)$/)) {
    this.logger.warn('parse dialogue: comparator not supported')
    return
  }
  return {
    func: comparators[matches[1]],
    children: [
      { value: parseExpr.call(this, matches[0]) },
      { value: parseExpr.call(this, matches[2]) }
    ]
  }
}

async function evaluateTree(tree) {
  if (tree.value != null) {
    if (typeof(tree.value) === 'object') {
      // invoke an action
      return await this.invokeFromObject(tree.value)
    }
    return tree.value
  } else {
    const args = await Promise.all(tree.children.map(c => evaluateTree.call(this, c)))
    return tree.func.apply(this, args)
  }
}

// Turns dialogue into action tree

function parseDialogueText(text) {
  let lines = text.split('\n')
  // Lines that don't start with control characters
  // (#, -, >, *, :, !) get merged with the previous line.
  lines = lines.reduce((newLines, line) => {
    const matches = _.trim(line).match(/^[#*:>!-]/)
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
      line.body = toInvokeObject(line.body)
    }
    if (line.control === 'conditional') {
      let matches = line.body
        .split('')
        .map(c => c === '[' ? ('"' + c) : c)
        .map(c => c === ']' ? (c + '"') : c)
        .join('')
        .match(/(?=\S)[^"\s]*(?:"[^\\"]*(?:\\[\s\S][^\\"]*)*"[^"\s]*)*/g)
      let clause
      if (matches[0] === 'if') {
        clause = matches[0]
        matches = matches.slice(1)
      } else if (matches[0] === 'else' && matches[1] === 'if') {
        clause = 'else-if'
        matches = matches.slice(2)
      } else if (matches[0] === 'else') {
        clause = 'else'
        if (matches.length > 1) {
          this.logger.warn('dialogue parsing: conditional after else')
        }
        matches = matches.slice(1)
      } else {
        this.logger.error(`dialogue parsing: unknown keyword ${matches[0]}`)
      }
      line.body = {
        clause: clause,
        evalTree: createEvalTree.call(this, matches)
      }
    }
    return line
  })
  // Throw if unknown character. I suspect this never happens because those lines already got merged.
  if (_.find(lines, line => line.control === 'unknown')) {
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
      this.rom.dialogue = parseDialogueText.call(this, text)
    }
  },

  run: class extends Action {
    async execute(label) {
      const rom = this.rom
      const dialogue = _.find(rom.dialogue, dialogue => dialogue.body === label)
      let activeSet = [].concat(dialogue.children)
      while (activeSet.length > 0) {
        switch (activeSet[0].control) {
          case 'action':
            await this.invokeFromObject(activeSet[0].body)
            activeSet = activeSet.slice(1)
            break
          case 'conditional':
            if (!activeSet[0].body.clause === 'if') {
              this.logger.error('dialogue: first conditional isn\'t if')
            }
            let numConditionals = _.findIndex(activeSet, node => node.control !== 'conditional' || node.body.clause === 'if', 1)
            // If numConditionals is -1, then all nodes are conditionals
            if (numConditionals === -1) {
              numConditionals = activeSet.length
            }
            let i
            for (i = 0; i < numConditionals; i++) {
              if (await evaluateTree.call(this, activeSet[i].body.evalTree)) {
                break
              }
            }
            if (i < numConditionals) {
              activeSet = [].concat(activeSet[i].children, activeSet.slice(numConditionals))
            } else {
              activeSet = activeSet.slice(numConditionals)
            }
            break
          case 'text':
            let numConsecutiveTexts = _.findIndex(activeSet, node => node.control === 'text' && node.children.length > 0) + 1 || activeSet.length
            numConsecutiveTexts = Math.min((_.findIndex(activeSet, node => node.control !== 'text') + 1 || activeSet.length + 1) - 1, numConsecutiveTexts)
            // If we see text, invoke dialog with as much of that text in a row, along with response prompts.
            if (numConsecutiveTexts > 0) {
              const result = await this.invoke('dialog', {
                text: activeSet.slice(0, numConsecutiveTexts).map(child => child.body),
                responses: activeSet[numConsecutiveTexts - 1].children.map(child => child.body)
              })
              if (activeSet[numConsecutiveTexts - 1].children.length === 0) {
                activeSet = activeSet.slice(numConsecutiveTexts)
              } else {
                activeSet = [].concat(activeSet[numConsecutiveTexts - 1].children[result].children, activeSet.slice(numConsecutiveTexts))
              }
            }
            break
        }
      }
    }
  }
}