// @flow strict

import { Quaternion, Vector2, Vector3 } from "three";

/*::
import type { BasicTransform } from "../animation/transform";


export type FreeCameraController = {
  update: () => void,
  setVelocity: (velocity: Vector2) => void,
  moveCursor: (movementX: number, movementY: number) => void,

  getControllerTransform(): BasicTransform
}
*/

export const createFreeCameraController = ()/*: FreeCameraController*/ => {
  const position = new Vector3(-20, 20, -20);
  const mouseRotation = new Vector2(-4, 0.4);
  const velocity = new Vector2(0, 0);

  const getRotationQuaternion = () => {
    const a = new Quaternion()
      .setFromAxisAngle(new Vector3(0, 1, 0), -mouseRotation.x);
    const b = new Quaternion()
      .setFromAxisAngle(new Vector3(1, 0, 0), -mouseRotation.y);

    a.multiply(b)

    return a;
  }

  const getControllerTransform = () => {
    return {
      position,
      rotation: getRotationQuaternion()
    }
  }
  const setVelocity = (nextVelocity) => {
    velocity.set(nextVelocity.x, -nextVelocity.y);
  }
  const update = () => {
    position.add(new Vector3(velocity.x, 0, velocity.y).applyQuaternion(getRotationQuaternion()));
    velocity.set(0, 0);
  }
  const moveCursor = (x, y) => {
    mouseRotation.x += x / 1000;
    mouseRotation.y += y / 1000;
  }
  return {
    getControllerTransform,
    moveCursor,
    update,
    setVelocity,
  }
};
