// @flow strict

import { h, useEffect, useMemo, useRef } from "@lukekaalim/act";
import { scene } from "@lukekaalim/act-three";
import { perspectiveCamera } from "@lukekaalim/act-three";
import { getVector2ForKeyboardState } from "../keyboard";
import { useKeyboardTrack, useKeyboardTrackEmitter } from "../keyboard/track";
import { getVectorForKeys } from "../keyboard/axis";
import { createFreeCameraController } from "../miniTheater/useFreeCameraController";
import { useFreeCameraController } from "../camera/useFreeCameraController";
import { useRenderSetup } from "../three/useRenderSetup";
import { GridHelperGroup } from "../../docs/src/controls/helpers";
import { ModelResourceObject } from "./ModelResourceObject";

/*::
import type { KeyboardTrack } from "../keyboard/track";
import type { Component, Ref } from "@lukekaalim/act";
import type { Object3D, PerspectiveCamera } from "three";
import type { LoopController } from "../three/useLoopController";
import type { RenderSetup } from "../three/useRenderSetup";

export type ModelResourceExplorerCanvasProps = {
  modelRoot: Object3D,
};
*/

export const ModelResourceExplorerCanvas/*: Component<ModelResourceExplorerCanvasProps>*/ = ({
  modelRoot,
}) => {
  const render = useRenderSetup();
  const cameraController = useFreeCameraController(render)
  const object = useMemo(() => modelRoot.clone(true), [modelRoot]);

  useEffect(() => {
    return render.loop.subscribeSimulate((c, v) => {
      cameraController.setObjectTransform(c.camera);
    })
  }, [render])

  return [
    h('canvas', { tabIndex: 0, ref: render.canvasRef, width: 800, height: 800 }),
    h(scene, { ref: render.sceneRef }, [
      h(perspectiveCamera, { ref: render.cameraRef }),
      h(ModelResourceObject, { object, showHiddenObjects: true }),
      h(GridHelperGroup, { })
    ]),
  ];
};