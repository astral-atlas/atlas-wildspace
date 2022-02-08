// @flow strict
/*:: import type { Component, Ref } from '@lukekaalim/act'; */
/*:: import type { Camera, PerspectiveCamera, Scene } from "three"; */
import { h, useEffect } from "@lukekaalim/act";
import {
  scene, perspectiveCamera,
  useRenderLoop, useWebGLRenderer,
  useResizingRenderer
} from "@lukekaalim/act-three";

import { GridHelperGroup } from "./helpers";

/*::
type ControlCanvasProps = {
  sceneRef: Ref<?Scene>,
  cameraRef: Ref<?PerspectiveCamera>,
  canvasRef: Ref<?HTMLCanvasElement>
};
*/

export const ControlCanvas/*: Component<ControlCanvasProps>*/ = ({
  canvasRef,
  sceneRef,
  cameraRef,
  children
}) => {
  const renderer = useWebGLRenderer(canvasRef);

  useRenderLoop(renderer, (cameraRef/*: any*/), sceneRef);

  const canvasSize = useResizingRenderer(canvasRef, renderer);
  useEffect(() => {
    const { current: camera } = cameraRef;
    if (!camera || !canvasSize)
      return;
    camera.fov = 40;
    camera.aspect = canvasSize.x / canvasSize.y;
    camera.updateProjectionMatrix();
  }, [canvasSize])

  return [
    h(scene, { ref: sceneRef }, [
      h(perspectiveCamera, { ref: cameraRef }),
      h(GridHelperGroup),
      children,
    ])
  ]
};