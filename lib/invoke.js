// keep calling this.invoke until there's nothing left.

module.exports = class extends Action {
  async execute(program) {
    while (program) {
      program = await this.invokeFromObject(program)
    }
  }
}