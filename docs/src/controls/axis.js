// @flow strict

export const up/*:    [number, number]*/ = [0,  1];
export const down/*:  [number, number]*/ = [0, -1];
export const left/*:  [number, number]*/ = [-1, 0];
export const right/*: [number, number]*/ = [1,  0];

export const wasdAxis = {
  KeyW: up,
  KeyA: left,
  KeyS: down,
  KeyD: right,
};
export const arrowAxis = {
  ArrowUp: up,
  ArrowLeft: left,
  ArrowDown: down,
  ArrowRight: right,
};

export const getVectorForKeys = (
  keys/*: string[]*/
)/*: [number, number]*/ => {
  return keys
    .map(key => wasdAxis[key] || arrowAxis[key] || null)
    .filter(Boolean)
    .reduce((acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]], [0, 0])
};