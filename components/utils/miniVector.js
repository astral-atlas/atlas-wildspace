// @flow strict
/*::
import type { MiniVector, MiniQuaternion } from "@astral-atlas/wildspace-models";
*/
import { Vector3, Quaternion } from "three";

export const miniVectorToThreeVector = (a/*: MiniVector*/)/*: Vector3*/ => {
  return new Vector3(a.x, a.y, a.z);
};
export const vectorToMiniVector = (v/*: Vector3*/)/*: MiniVector*/ => {
  return { x: v.x, y: v.y, z: v.z }
}

export const miniQuaternionToThreeQuaternion = (a/*: MiniQuaternion*/)/*: Quaternion*/ => {
  return new Quaternion(a.x, a.y, a.z, a.w);
};
export const quaternionToMiniQuaternion = (q/*: Quaternion*/)/*: MiniQuaternion*/ => {
  return { x: q.x, y: q.y, z: q.z, w: q.w }
}

export const vectorSetMini = (vector/*: Vector3*/, mini/*: MiniVector*/) => {
  vector.set(mini.x, mini.y, mini.z);
}
export const quaternionSetMini = (quaternion/*: Quaternion*/, mini/*: MiniQuaternion*/) => {
  quaternion.set(mini.x, mini.y, mini.z, mini.w);
}