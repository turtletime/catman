const FPS = 60

const fade = (from, to) => (seconds, skipFrames) => new Promise((resolve, reject) => {
  skipFrames = skipFrames || 1
  Game.blackout.alpha = from
  let frames = 0
  let increment = (1.0 / seconds / FPS) * (to - from)
  const fade = () => {
    if (frames % skipFrames === 0) {
      Game.blackout.alpha += increment * skipFrames
    }
    if (frames++ < seconds * FPS) {
      requestAnimationFrame(fade)
    } else {
      Game.blackout.alpha = to
      resolve()
    }
  }
  fade()
})

module.exports = {
  fadeIn: fade(1, 0),
  fadeOut: fade(0, 1)
}
