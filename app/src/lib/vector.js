const createVector2 = (x = 0, y = 0) => ({
  x, y
});

const addVector2 = (...v) => ({
  x: v.reduce((acc, curr) => curr.x + acc, 0),
  y: v.reduce((acc, curr) => curr.y + acc, 0),
});

const subtractVector2 = (...v) => ({
  x: v.reduce((acc, curr) => curr.x - acc, 0),
  y: v.reduce((acc, curr) => curr.y - acc, 0),
})

const negateVector2 = (v) => ({
  x: -v.x,
  y: -v.y,
})

export {
  createVector2,
  addVector2,
  subtractVector2,
  negateVector2
}