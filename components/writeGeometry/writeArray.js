// @flow strict
/*::
import type { Box2, Matrix4, Vector2, Vector3 } from "three";
*/

export const writeArrayDoublet = (
  array/*: $TypedArray | number[]*/,
  index/*: number*/,
  x/*: number*/,
  y/*: number*/
) => {
  array[index + 0] = x;
  array[index + 1] = y;
}
export const writeArrayTriplet = (
  array/*: $TypedArray | number[]*/,
  index/*: number*/,
  x/*: number*/,
  y/*: number*/, 
  z/*: number*/
) => {
  array[index + 0] = x;
  array[index + 1] = y;
  array[index + 2] = z;
}

export const writeArrayVector2s = (
  array/*: $TypedArray | number[]*/,
  index/*: number*/,
  vectors/*: Vector2[]*/
) => {
  for (let i = 0; i < vectors.length; i++)
    writeArrayDoublet(array, index + (i * 2), vectors[i].x, vectors[i].y)
}
export const writeArrayVector3s = (
  array/*: $TypedArray | number[]*/,
  index/*: number*/,
  vectors/*: Vector3[]*/
) => {
  for (let i = 0; i < vectors.length; i++)
    writeArrayTriplet(array, index + (i * 3), vectors[i].x, vectors[i].y, vectors[i].z)
}