module.exports = {
  fadeIn: (seconds) => new Promise((resolve, reject) => {
    Game.blackout.alpha = 1
    setTimeout(resolve, seconds * 1000);
  }),
  fadeOut: (seconds) => new Promise((resolve, reject) => {
    setTimeout(() => {
      Game.blackout.alpha = 0
      resolve()
    }, seconds * 1000);
  })
}
