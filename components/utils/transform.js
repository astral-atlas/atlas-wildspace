// @flow strict

import { Quaternion, Vector3 } from "three";

/*::
import type {
  MiniQuaternion,
  MiniVector,
} from "@astral-atlas/wildspace-models";
import type { BasicTransform } from "../animation/transform";
*/

export const hydrateBasicTransformFromMini = (
  position/*: MiniVector*/,
  rotation/*: MiniQuaternion*/
)/*: BasicTransform*/ => {
  return {
    position: new Vector3(position.x, position.y, position.z),
    rotation: new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
  }
}