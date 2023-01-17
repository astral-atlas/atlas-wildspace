// @flow strict

import { useEffect, useState } from "@lukekaalim/act";
import { Euler, Quaternion, Vector2, Vector3 } from "three";
import { getVector2ForKeyboardState } from "../keyboard/axis";
import { useElementKeyboard } from "../keyboard/changes";
import { useKeyboardState } from "../keyboard/state";
import { useKeyboardTrack } from "../keyboard/track";

/*::
import type { Object3D } from "three";
import type { Ref } from "@lukekaalim/act";

import type { BasicTransform } from "../animation/transform";
import type { RenderSetup } from "../three/useRenderSetup";
import type { KeyboardState } from "../keyboard/state";
import type { LoopController } from "../three/useLoopController";
import type { KeyboardTrack } from "../keyboard/track";


export type FreeCameraController = {
  update: () => void,
  setVelocity: (velocity: Vector3) => void,
  moveCursor: (movementX: number, movementY: number) => void,

  rotation: Quaternion,
  position: Vector3,

  getControllerTransform(): BasicTransform,
  setObjectTransform(object: Object3D): void
}
*/

const X_AXIS = new Vector3(0, 1, 0);
const Y_AXIS = new Vector3(1, 0, 0);
const Z_AXIS = new Vector3(0, 0, 1);

const polarRotationToQuaternion = (polar/*: Vector2*/, quaternion/*: Quaternion*/) => {
  const euler = new Euler();
  euler.order = "YZX";
  euler.set(polar.x, polar.y, 0)
  
  quaternion.setFromEuler(euler);
};
const quaternionToPolarRotation = (quaternion/*: Quaternion*/, polar/*: Vector2*/) => {
  const euler = new Euler();
  euler.order = "YZX";
  
  euler.setFromQuaternion(quaternion);
  polar.set(euler.x, euler.y);
}


export const createFreeCameraController = (
  initialPosition/*: ?Vector3*/ = null,
  initialRotation/*: ?Quaternion*/ = null,
)/*: FreeCameraController*/ => {
  const position = new Vector3(-20, 20, -20);
  if (initialPosition)
    position.copy(initialPosition)
  const mouseRotation = new Vector2(-4, 0.4);
  if (initialRotation) {
    quaternionToPolarRotation(initialRotation, mouseRotation);
  }

  const rotation = new Quaternion(0, 0, 0, 0);
  polarRotationToQuaternion(mouseRotation, rotation);

  const velocity = new Vector3(0, 0, 0);
  
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
    mouseRotation.set(mouseRotation.x + (-y / 1000), mouseRotation.y + (-x / 1000));
    polarRotationToQuaternion(mouseRotation, rotation);
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
    rotation,
    position,
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

export const subscribeFreeCameraUpdates = (
  controller/*: FreeCameraController*/,
  surface/*: HTMLElement*/,
  loop/*: LoopController*/,
  track/*: KeyboardTrack*/,
  onFocusChange/*: (isFocused: boolean) => void*/ = () => {},
)/*: { unsubscribe: () => void }*/ => {
  let moveCam = false;
  const onMouseMove = (event/*: MouseEvent*/) => {
    if (moveCam) {
      controller.moveCursor(event.movementX, event.movementY);
    }
  }
  const onClick = () => {
    if (!moveCam) {
      surface.requestPointerLock();
      moveCam = true;
      onFocusChange(true);
    } else {
      document.exitPointerLock()
    }
  }
  const onPointerLockChange = () => {
    if (!document.pointerLockElement) {
      moveCam = false;
      onFocusChange(false);
    }
  }
  surface.addEventListener('mousemove', onMouseMove)
  surface.addEventListener('click', onClick)
  document.addEventListener('pointerlockchange', onPointerLockChange)
  
  const unsubscribeInput = loop.subscribeInput((c, v) => {
    if (!moveCam)
      return;
    const { next: keys } = track.readDiff();
    const velocity = getFreecamVelocity(keys.value);
    controller.setVelocity(velocity);
  });
  const unsubscribeSim = loop.subscribeSimulate((c, v) => {
    controller.update();
  });

  const unsubscribe = () => {
    unsubscribeInput();
    unsubscribeSim();
    surface.removeEventListener('mousemove', onMouseMove)
    surface.removeEventListener('click', onClick)
    document.removeEventListener('pointerlockchange', onPointerLockChange)
  };
  return { unsubscribe };
}

export const useFreeCameraSubscription = (
  surfaceRef/*: Ref<?HTMLElement>*/,
  controller/*: ?FreeCameraController*/,
  loop/*: LoopController*/,
  track/*: KeyboardTrack*/,
) => {
  useEffect(() => {
    const { current: surface } = surfaceRef;
    if (!surface || !controller)
      return;

    const onMouseMove = (event/*: MouseEvent*/) => {
      if (document.pointerLockElement === surface)
        controller.moveCursor(event.movementX, event.movementY);
    }
    const onClick = () => {
      if (document.pointerLockElement === surface)
        document.exitPointerLock();
      else
        surface.requestPointerLock();
    }

    surface.addEventListener('mousemove', onMouseMove)
    surface.addEventListener('click', onClick)
    
    const unsubscribeInput = loop.subscribeInput((c, v) => {
      if (document.pointerLockElement !== surface)
        return;
      const { next: keys } = track.readDiff();
      const velocity = getFreecamVelocity(keys.value);
      controller.setVelocity(velocity);
    });
    const unsubscribeSim = loop.subscribeSimulate((c, v) => {
      controller.update();
    });

    return () => {
      unsubscribeInput();
      unsubscribeSim();
      surface.removeEventListener('mousemove', onMouseMove)
      surface.removeEventListener('click', onClick)
    }
  }, [track, loop]);
};
