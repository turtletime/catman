module.exports = {
  set: class extends Action {
    async execute(field, value) {
      if (!this.state.progress) {
        this.state.progress = new Map()
      }
      this.state.progress.set(field, parseInt(value))
    }
  },
  get: class extends Action {
    async execute(field) {
      if (!this.state.progress) {
        this.state.progress = new Map()
      }
      return this.state.progress.get(field) || 0
    }
  }
}
