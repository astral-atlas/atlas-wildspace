// @flow strict

import { useEffect, useState } from "@lukekaalim/act";
import { Quaternion, Vector2, Vector3 } from "three";
import { getVector2ForKeyboardState } from "../keyboard/axis";

/*::
import type { BasicTransform } from "../animation/transform";
import type { Object3D } from "three";
import type { RenderSetup } from "../three/useRenderSetup";
import type { KeyboardState } from "../keyboard/state";


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
  const rotation = new Quaternion(0, 0, 0, 0);
  const velocity = new Vector3(0, 0, 0);
  
  rotation.setFromAxisAngle(X_AXIS, -mouseRotation.x)
      .multiply(new Quaternion().setFromAxisAngle(Y_AXIS, -mouseRotation.y))

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

const getAltituteVector = (keys) => {
  const up = keys.has('Space') ? 1: 0;
  const down = keys.has('ControlLeft') ? -1 : 0;
  return up + down;
}

export const getFreecamVelocity = (keys/*: KeyboardState*/)/*: Vector3*/ => {
  const altitudeVelocity = getAltituteVector(keys);
  const axisVelocity = getVector2ForKeyboardState(keys);
  return new Vector3(axisVelocity.x, altitudeVelocity, -axisVelocity.y);
}

export const useFreeCameraController = (render/*: RenderSetup*/)/*: FreeCameraController*/ => {
  const [controller] = useState/*:: <FreeCameraController>*/(() => createFreeCameraController());

  useEffect(() => {
    const { current: camera } = render.cameraRef;
    const { current: canvas } = render.canvasRef;
    if (!canvas)
      return;

    const onMouseMove = (event/*: MouseEvent*/) => {
      if (document.pointerLockElement === canvas)
        controller.moveCursor(event.movementX, event.movementY);
    }
    const onClick = () => {
      if (document.pointerLockElement === canvas)
        document.exitPointerLock();
      else
        canvas.requestPointerLock();
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('click', onClick)
    
    const unsubscribeInput = render.loop.subscribeInput((c, v) => {
      if (document.pointerLockElement !== canvas)
        return;
      const { next: keys } = render.keyboard.readDiff();
      const velocity = getFreecamVelocity(keys.value);
      controller.setVelocity(velocity);
    });
    const unsubscribeSim = render.loop.subscribeSimulate((c, v) => {
      controller.update();
    });

    return () => {
      unsubscribeInput();
      unsubscribeSim();
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('click', onClick)
    }
  }, [render]);

  return controller;
}