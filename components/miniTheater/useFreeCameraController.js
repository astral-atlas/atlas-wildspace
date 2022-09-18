// @flow strict

import { Quaternion, Vector2, Vector3 } from "three";

/*::
import type { BasicTransform } from "../animation/transform";
import type { Object3D } from "three";


export type FreeCameraController = {
  update: () => void,
  setVelocity: (velocity: Vector3) => void,
  moveCursor: (movementX: number, movementY: number) => void,

  getControllerTransform(): BasicTransform,
  setObjectTransform(object: Object3D): void
}
*/

const X_AXIS = new Vector3(0, 1, 0);
const Y_AXIS = new Vector3(1, 0, 0);

export const createFreeCameraController = ()/*: FreeCameraController*/ => {
  const position = new Vector3(-20, 20, -20);
  const mouseRotation = new Vector2(-4, 0.4);
  const rotation = new Quaternion();
  const velocity = new Vector3(0, 0, 0);

  const setRotation = (x, y) => {
    mouseRotation.x += x / 1000;
    mouseRotation.y += y / 1000;

    rotation
      .setFromAxisAngle(X_AXIS, -mouseRotation.x)
      .multiply(new Quaternion().setFromAxisAngle(Y_AXIS, -mouseRotation.y));
  }

  const getControllerTransform = () => {
    return {
      position,
      rotation
    }
  }
  const setVelocity = (nextVelocity) => {
    velocity.copy(nextVelocity)
  }
  const update = () => {
    position.add(velocity.applyQuaternion(rotation));
    velocity.set(0, 0, 0);
  }
  const moveCursor = (x, y) => {
    setRotation(x, y);
  }
  const setObjectTransform = (object) => {
    object.position.copy(position);
    object.quaternion.copy(rotation);
  }
  return {
    getControllerTransform,
    moveCursor,
    update,
    setVelocity,
    setObjectTransform,
  }
};
