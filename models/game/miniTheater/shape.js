// @flow strict

import { c } from "@lukekaalim/cast";
import { castMiniQuaternion, castMiniVector } from "./primitives.js";

/*::
import type { Cast } from "@lukekaalim/cast/main";
import type { BoardPosition } from "../../encounter/map";
import type { MiniQuaternion, MiniVector } from "./primitives";

export type MiniTheaterShape =
  | { type: 'box', position: MiniVector, rotation: MiniQuaternion, size: MiniVector }
*/

export const castMiniTheaterShape/*: Cast<MiniTheaterShape>*/ = c.or('type', {
  'box': c.obj({
    type: c.lit('box'),
    position: castMiniVector,
    rotation: castMiniQuaternion,
    size: castMiniVector
  })
})