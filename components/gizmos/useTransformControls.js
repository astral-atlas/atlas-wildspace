// @flow strict
/*::
import type { Ref } from "@lukekaalim/act";
import type { Object3D } from "three";
*/

import { renderCanvasContext, useChildObject } from "../three"

import { TransformControls } from "three/addons/controls/TransformControls.js";
import { useContext, useEffect } from "@lukekaalim/act";

/*::
export type TransformControlEvents<T> = {
  change?: (object: T) => void,
}
*/

export const useTransformControls = /*:: <T: Object3D>*/(
  targetRef/*: Ref<?T>*/,
  mode/*: 'translate' | 'rotate' | 'scale'*/,
  events/*: TransformControlEvents<T>*/ = {},
  deps/*: mixed[]*/ = []
) => {
  const render = useContext(renderCanvasContext);
  const controls = useChildObject(render?.sceneRef, parent => {
    if (!render)
      return null;
    const { current: camera } = render.cameraRef;
    const { current: canvas } = render.canvasRef;
    const { current: target } = targetRef;
    if (!camera || !canvas || !target)
      return null;

    const controls = new TransformControls(camera, canvas);
    controls.attach(target)
    return controls;
  }, [render]);

  useEffect(() => {
    const { current: target } = targetRef;
    const { change } = events;
    if (!controls || !change || !target)
      return;
    const onChange = () => {
      change(target);
    }
    controls.addEventListener('change', onChange)
    return () => {
      controls.removeEventListener('change', onChange)
    }
  }, [controls, ...deps]);

  useEffect(() => {
    if (!controls)
      return;
    controls.mode = mode;
  }, [controls, mode])
}