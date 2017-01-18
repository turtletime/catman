const GameObject = require('../core/game-object.js');

module.exports = class Text extends GameObject {
  async init() {
    const rect = new PIXI.Graphics()
    const pixiText = new PIXI.Text('', {
      fontFamily: "Courier New",
      fontSize: 12,
      fill: "white",
      wordWrap: true,
      wordWrapWidth: 256 - 16
    })
    pixiText.x = 8
    pixiText.y = 256 - 64 + 8

    let currentText = []
    let stage = 0
    // order matters
    this.gameState.scene.stage.addChild(rect)
    this.gameState.scene.stage.addChild(pixiText)
    rect.displayGroup = this.gameState.graphics.displayGroups.uiGroup
    pixiText.displayGroup = this.gameState.graphics.displayGroups.uiGroup

    this.reset = (text) => {
      currentText = text || []
      stage = 0
      if (stage < currentText.length) {
        pixiText.text = currentText[stage]
        rect.lineStyle(4, 0xFFFFFF, 1)
        rect.beginFill(0x000000)
        rect.drawRect(0, 0, 256, 64)
        rect.endFill();
        rect.x = 0
        rect.y = 256 - 64
      } else {
        pixiText.text = ''
        rect.clear()
      }
    }

    this.advance = () => {
      if (stage >= currentText.length - 1) {
        this.reset()
        return false
      } else {
        stage++
        pixiText.text = currentText[stage]
        return true
      }
    }
  }
}
