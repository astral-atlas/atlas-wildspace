// @flow strict


const pointIntersectsBoxShape = (point, boxArea) => {
  const lowerBounds = [
    boxArea.origin[0] - Math.floor(boxArea.width / 2),
    boxArea.origin[1] - Math.floor(boxArea.height / 2),
    boxArea.origin[2] - Math.floor(boxArea.depth / 2),
  ]
  const upperBounds = [
    boxArea.origin[0] + Math.floor(boxArea.width / 2),
    boxArea.origin[1] + Math.floor(boxArea.height / 2),
    boxArea.origin[2] + Math.floor(boxArea.depth / 2),
  ]
  const pointAboveLowerBounds = (
    point[0] >= lowerBounds[0] &&
    point[1] >= lowerBounds[1] &&
    point[2] >= lowerBounds[2]
  )
  const pointBelowUpperBounds = (
    point[0] <= upperBounds[0] &&
    point[1] <= upperBounds[1] &&
    point[2] <= upperBounds[2]
  )
  return pointAboveLowerBounds && pointBelowUpperBounds;
}

export const pointIntersectsShape = (point, area) => {
  switch (area.type) {
    case 'box':
      return pointIntersectsBoxShape(point, area)
    default:
      throw new Error();
  }
}