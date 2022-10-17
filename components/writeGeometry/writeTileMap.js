// @flow strict
/*::
import type { Box2 } from "three";
*/

import { Vector2, Vector3 } from "three";
import { writeArrayDoublet, writeArrayTriplet, writeArrayVector2s } from "./writeArray";

const vectorTen = new Vector2(10, 10);
export const writeArrayQuadPositions = (
  array/*: $TypedArray | number[]*/,
  index/*: number*/,
  point/*: Vector3*/,
  size/*: number*/ = 5,
) => {
  writeArrayTriplet(array, index + (0 * 3), point.x - size, point.y, point.z - size);
  writeArrayTriplet(array, index + (1 * 3), point.x - size, point.y, point.z + size);
  writeArrayTriplet(array, index + (2 * 3), point.x + size, point.y, point.z + size);


  writeArrayTriplet(array, index + (3 * 3), point.x - size, point.y, point.z - size);
  writeArrayTriplet(array, index + (4 * 3), point.x + size, point.y, point.z + size);
  writeArrayTriplet(array, index + (5 * 3), point.x + size, point.y, point.z - size);
}

export const writeUVQuadPositions = (
  array/*: $TypedArray | number[]*/,
  index/*: number*/,
  points/*: Vector2[]*/
) => {
  writeArrayVector2s(array, index, [
    points[0],
    points[1],
    points[2],

    points[0],
    points[2],
    points[3],
  ])
}

const bottomLeft =  new Vector2(1, 0);
const topLeft =     new Vector2(1, 1);
const topRight =    new Vector2(0, 1);
const bottomRight = new Vector2(0, 0);


const unitQuad2 = [
  bottomLeft,
  topLeft,
  topRight,
  bottomRight,
];

const downUnitQuad2 = [
  topRight,
  bottomRight,
  bottomLeft,
  topLeft,
];
const leftUnitQuad2 = [
  bottomRight,
  bottomLeft,
  topLeft,
  topRight,
];
const rightUnitQuad2 = [
  topLeft,
  topRight,
  bottomRight,
  bottomLeft,
];

const orientations = [
  unitQuad2,
  rightUnitQuad2,
  downUnitQuad2,
  leftUnitQuad2,
]

export const calculate2dQuadUVs = (
  uvOffset/*: Vector2*/,
  uvSize/*: Vector2*/,
  orientation/*: number*/,
)/*: Vector2[]*/ => {
  return orientations[orientation % 4]
    .map(v => v
        .clone()
        .add(uvOffset)
        .multiply(uvSize))
}