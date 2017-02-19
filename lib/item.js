module.exports = {
  obtain: class extends Action {
    async execute(item, quantity) {
      if (!this.state.inventory) {
        this.state.inventory = new Map()
      }
      let newQuantity = parseInt(quantity) || 1;
      if (this.state.inventory.has(item)) {
        newQuantity += this.state.inventory.get(item)
      }
      this.state.inventory.set(item, newQuantity)
      // TODO: check articles and plurals
      await this.invoke('dialog', [`(You obtained the ${item}.)`])
    }
  },
  count: class extends Action {
    async execute(item) {
      if (!this.state.inventory) {
        this.state.inventory = new Map()
      }
      return this.state.inventory.get(item) || 0
    }
  }
}