// @flow strict


import { c } from "@lukekaalim/cast";

/*::
import type { Cast } from "@lukekaalim/cast";

export type MiniVector = {
  x: number,
  y: number,
  z: number,
};
export type MiniQuaternion = {
  x: number,
  y: number,
  z: number,
  w: number
};
*/

export const castMiniVector/*: Cast<MiniVector>*/ = c.obj({
  x: c.num,
  y: c.num,
  z: c.num,
});

export const castMiniQuaternion/*: Cast<MiniQuaternion>*/ = c.obj({
  x: c.num,
  y: c.num,
  z: c.num,
  w: c.num,
});

