// @flow strict

export const rotateVector = (
  rotation/*: number*/,
  position/*: [number, number]*/,
)/*: [number, number]*/ => {
  const radians = rotation * Math.PI * 2;

  const forward = [Math.cos(radians), Math.sin(radians)];
  const right = [Math.cos(radians + Math.PI/2), Math.sin(radians + Math.PI/2)];

  return [
    (right[0] * position[0]) + (forward[0] * position[1]),
    (right[1] * position[0]) + (forward[1] * position[1]),
  ];
};