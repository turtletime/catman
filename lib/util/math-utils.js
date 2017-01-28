module.exports = {
  intersects: (x1, y1, w1, h1, x2, y2, w2, h2) => {
    return !(x1 + w1 / 2 < x2 - w2 / 2 || x2 + w2 / 2 < x1 - w1 / 2 || y1 + h1 / 2 < y2 - h2 / 2 || y2 + h2 / 2 < y1 - h1 / 2)
  },
  containedIn: (x1, y1, w1, h1, x2, y2, w2, h2) => {
    return x1 - w1 / 2 >= x2 - w2 / 2 && x1 + w1 / 2 <= x2 + w2 / 2 && y1 - h1 / 2 >= y2 - h2 / 2 && y1 + h1 / 2 <= y2 + h2 / 2
  },
  inRectangle: (x1, y1, x2, y2, w2, h2) => {
    return x2 - w2 / 2 < x1 && x2 + w2 / 2 > x1 && y2 - h2 / 2 < y1 && y2 + h2 / 2 > y1
  },
  lerp: (a, b, t) => a * (1 - t) + b * t,
  clamp: (x, min, max) => {
    if (min === null || x > min) {
      if (max === null || x < max) {
        return x
      }
      return max
    }
    return min
  }
}