const _ = require('lodash')
const clamp = require('./util/math-utils.js').clamp

// turtletime guest appearance
class PercentageAndPixel {
  constructor(str) {
    this.percentage = 0;
    this.pixel = 0;
    if (typeof(str) === 'number') {
      this.pixel = str;
      return;
    }
    let matchedArray = str.match("(\\+|-|)(\\d*\\.{0,1}\\d*)(%|px)\\s*(\\+|-)(\\s*\\d*\\.{0,1}\\d*)(%|px)");
    if (matchedArray == null) {
      matchedArray = str.match("(\\+|-|)(\\d*\\.{0,1}\\d*)(%|px)");
      if (matchedArray == null) {
        return;
      }
    }
    if (matchedArray.length >= 3) {
      if (matchedArray[3] == "%") {
        this.percentage += parseFloat(matchedArray[1] + matchedArray[2]) / 100;
      } else {
        this.pixel += parseFloat(matchedArray[1] + matchedArray[2]);
      }
    }
    if (matchedArray.length >= 6) {
      if (matchedArray[6] == "%") {
        this.percentage += parseFloat(matchedArray[4] + matchedArray[5]) / 100;
      } else {
        this.pixel += parseFloat(matchedArray[4] + matchedArray[5]);
      }
    }
  }

  eval(outerValue) {
    return outerValue * this.percentage + this.pixel;
  }
}

function executePrivate(path, uiDefMixin) {
  const result = this.instantiate('ui', uiDefMixin);
  // normalize it
  [['position', 'x'], ['position', 'y'],
  ['size', 'w'], ['size', 'h']].forEach(arr => {
    result[arr[0]][arr[1]] = new PercentageAndPixel(result[arr[0]][arr[1]])
  })

  // Add to state blob
  const addToUITree = (obj, path, index) => {
    if (index === path.length) {
      obj.children.push(result)
      result.parent = obj
      obj.sceneTreeNode.addChild(result.sceneTreeNode)
      return
    }
    let child = _.find(obj.children, child => child.id === path[index])
    if (!child) {
      throw new Error('intermediate UI node not found')
    }
    addToUITree(child, path, index + 1)
  }

  // describe appearance
  const rect = new PIXI.Graphics()
  const pixiText = new PIXI.Text('', {
    fontFamily: "Courier New",
    fontSize: 12,
    fill: "white",
    wordWrap: true
  })

  result.sceneTreeNode = new PIXI.Container()
  result.sceneTreeNode.addChild(rect)
  result.sceneTreeNode.addChild(pixiText)

  if (path === null) {
    this.state.ui = result
    result.sceneTreeNode.displayGroup = this.state.graphics.displayGroups.uiGroup
    this.sceneTree.addChild(result.sceneTreeNode)
  } else {
    addToUITree(this.state.ui, path === '' ? [] : path.split('.'), 0)
  }

  // recursively deal with children
  for (let i = 0; i < result.children; i++) {
    result.children[i] = executePrivate.call(this, `${path}.${result.id}`, result.children[i])
  }
  result.refresh = () => {
    const outerRectangle = result.parent ? result.parent._rect : {
      x: 0, y: 0, w: this.state.graphics.screen.w, h: this.state.graphics.screen.h
    }
    const width = clamp(result.size.w.eval(outerRectangle.w), result.minSize.w, result.maxSize.w);
    const height = clamp(result.size.h.eval(outerRectangle.h), result.minSize.h, result.maxSize.h);
    result._rect = {
      x: outerRectangle.x + result.position.x.eval(outerRectangle.w) - width * result.anchor.x,
      y: outerRectangle.y + result.position.y.eval(outerRectangle.h) - height * result.anchor.y,
      w: width,
      h: height
    };
    if (result.visible) {
      rect.lineStyle(4, 0xFFFFFF, 1)
      rect.beginFill(0x000000)
      rect.drawRect(0, 0, result._rect.w, result._rect.h)
      rect.endFill()
      rect.x = result._rect.x
      rect.y = result._rect.y
      pixiText.style.wordWrapWidth = result._rect.w - 16
      pixiText.x = result._rect.x + 8
      pixiText.y = result._rect.y + 8
    } else {
      rect.clear()
    }
    pixiText.visible = result.visible
    result.children.forEach(child => child.refresh())
  }
  result.refresh()

  result.setText = (text) => {
    pixiText.text = result.text = text
  }
  result.setText(result.text || result.id)

  return result
}

module.exports = {
  create: class extends Action {
    async execute(path, uiDefMixin) {
      return executePrivate.call(this, path, uiDefMixin)
    }
  },

  get: class extends Action {
    async execute(path) {
      if (path === '') {
        return this.state.ui
      }
      let current = this.state.ui
      path = path.split('.')
      for (let i = 0; i < path.length; i++) {
        current = _.find(current.children, child => child.id === path[i])
        if (!current) {
          return null
        }
      }
      return current
    }
  },

  destroy: class extends Action {
    async execute(ui) {
      if (typeof(ui) === 'string') {
        ui = await this.invoke('get-ui', ui)
      }
      if (ui && ui.parent) {
        for (let i = 0; i < ui.children.length; i++) {
          await this.invoke('destroy-ui', ui.children[i])
        }
        ui.parent.children = _.difference(ui.parent.children, [ui])
        ui.parent.sceneTreeNode.removeChild(ui.sceneTreeNode)
        ui.parent = null
      }
    }
  }
}