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
  enabled/*: boolean*/ = true,
  events/*: TransformControlEvents<T>*/ = {},
  deps/*: mixed[]*/ = []
)/*: ?TransformControls*/ => {
  const render = useContext(renderCanvasContext);
  const controls = useChildObject(render?.sceneRef, () => {
    if (!render || !enabled)
      return null;
    const { current: camera } = render.cameraRef;
    const { current: canvas } = render.canvasRef;
    const { current: target } = targetRef;
    if (!camera || !canvas || !target)
      return null;

    const controls = new TransformControls(camera, canvas);
    controls.setMode(mode);
    controls.setRotationSnap(Math.PI / 4)
    controls.attach(target)
    return controls;
  }, [render, enabled]);

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
    controls.setMode(mode);
  }, [controls, mode])

  return controls;
}