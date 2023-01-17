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
  changeFinish?: (object: T) => void,
}

export type TransformOptions = {
  rotationSnap: null | number,
}
*/

export const useTransformControls = /*:: <T: Object3D>*/(
  targetRef/*: Ref<?T>*/,
  mode/*: 'translate' | 'rotate' | 'scale'*/,
  enabled/*: boolean*/ = true,
  events/*: TransformControlEvents<T>*/ = {},
  deps/*: mixed[]*/ = [],
  options/*: TransformOptions*/ = { rotationSnap: Math.PI / 4 }
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
    if (options.rotationSnap)
      controls.setRotationSnap(options.rotationSnap)

    controls.attach(target)
    return controls;
  }, [render, enabled, options]);

  useEffect(() => {
    const { current: target } = targetRef;
    const { change, changeFinish } = events;
    if (!controls || !target)
      return;
    const onChange = () => {
      if (change)
        change(target);
    }
    const onDragging = (e) => {
      if (!e.value && changeFinish)
        changeFinish(target)
    }
    controls.addEventListener('change', onChange)
    controls.addEventListener('dragging-changed', onDragging)
    return () => {
      controls.removeEventListener('change', onChange)
      controls.removeEventListener('dragging-changed', onDragging)
    }
  }, [controls, ...deps]);

  useEffect(() => {
    if (!controls)
      return;
    controls.setMode(mode);
  }, [controls, mode])

  return controls;
}