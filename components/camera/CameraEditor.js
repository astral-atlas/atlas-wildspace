// @flow strict

import { h, useEffect, useState } from "@lukekaalim/act"
import { perspectiveCamera } from "@lukekaalim/act-three"
import {
  subscribeFreeCameraUpdates,
  createFreeCameraController,
} from "./useFreeCameraController";

/*::
import type { Component } from "@lukekaalim/act/component";
import type { Ref } from "@lukekaalim/act/hooks";
import type { PerspectiveCamera } from "three";
import type { LoopController } from "../three/useLoopController";
import type { KeyboardTrack } from "../keyboard/track";

export type CameraEditorProps = {
  cameraRef: Ref<?PerspectiveCamera>,
  surfaceRef: Ref<?HTMLElement>,
  loop: LoopController,
  track: KeyboardTrack,
  onCameraChange?: PerspectiveCamera => void,
};
*/

export const CameraEditor/*: Component<CameraEditorProps>*/ = ({
  cameraRef,
  surfaceRef,
  loop,
  track,
  onCameraChange = _ => {}
}) => {
  const [] = useState();

  useEffect(() => {
    const { current: surface } = surfaceRef;
    const { current: camera } = cameraRef;
    if (!surface || !camera)
      return;

    const onFocusChange = (isFocused) => {
      onCameraChange(camera);
    }

    const controller = createFreeCameraController();
    const subscription = subscribeFreeCameraUpdates(
      controller, surface, loop, track,
      onFocusChange
    )
    return () => {
      subscription.unsubscribe();
    }
  }, [])
  return h(perspectiveCamera, {
    ref: cameraRef
  })
}