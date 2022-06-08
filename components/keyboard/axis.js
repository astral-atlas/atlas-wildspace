// @flow strict
/*::
import type { KeyboardState } from "./state";
*/

import { Vector2 } from "three";

const up = new Vector2(0, 1);
const down = new Vector2(0, -1);
const left = new Vector2(-1, 0);
const right = new Vector2(1, 0);

const wasdAxis = {
  KeyW: up,
  KeyA: left,
  KeyS: down,
  KeyD: right,
};
const arrowAxis = {
  ArrowUp: up,
  ArrowLeft: left,
  ArrowDown: down,
  ArrowRight: right,
};
const keysAxis = {
  ...wasdAxis,
  ...arrowAxis
};

const keysNames = [
  'KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyS', 'ArrowUp', 'ArrowDown'
]

export const getVectorForKeys = (
  keys/*: string[]*/,
  scale/*: number*/ = 1
)/*: [number, number]*/ => {
  const v = keys
    .map(key => wasdAxis[key] || arrowAxis[key] || null)
    .filter(Boolean)
    .reduce((acc, curr) => acc.add(curr.clone().multiplyScalar(scale)), new Vector2(0, 0))

  return [v.x, v.y];
};

export const getVector2ForKeyboardState = (
  keys/*: KeyboardState*/,
)/*: Vector2*/ => {
  return keysNames
    .map(key => keys.has(key) ? keysAxis[key] : null)
    .filter(Boolean)
    .reduce((acc, curr) => acc.add(curr), new Vector2(0, 0))
    .clampLength(0, 1)
}