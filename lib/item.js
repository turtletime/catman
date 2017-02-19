module.exports = {
  obtain: class extends Action {
    async execute(item, quantity) {
      if (!this.state.inventory) {
        this.state.inventory = new Map()
      }
      let newQuantity = quantity;
      if (this.state.inventory.has(item)) {
        newQuantity += this.state.inventory.get(item)
      }
      this.state.inventory.set(item, newQuantity)
      // TODO: check articles and plurals
      await this.invoke('dialog', [`(You obtained the ${item}.)`])
    }
  }
}