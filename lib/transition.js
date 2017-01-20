
const FPS = 60

const fade = (blackout, from, to, seconds, skipFrames) => new Promise((resolve, reject) => {
  skipFrames = skipFrames || 1
  blackout.alpha = from
  let frames = 0
  let increment = (1.0 / seconds / FPS) * (to - from)
  const fade = () => {
    if (frames % skipFrames === 0) {
      blackout.alpha += increment * skipFrames
    }
    if (frames++ < seconds * FPS) {
      requestAnimationFrame(fade)
    } else {
      blackout.alpha = to
      resolve()
    }
  }
  fade()
})

module.exports = {
  fadeIn: class extends Action { execute(seconds, skipFrames) {
    return fade(this.state.graphics.baked.blackout, 1, 0, seconds, skipFrames)
  } },
  fadeOut: class extends Action { execute(seconds, skipFrames) {
    return fade(this.state.graphics.baked.blackout, 0, 1, seconds, skipFrames)
  } }
}
