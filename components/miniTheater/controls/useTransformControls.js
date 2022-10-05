// @flow strict

import { useContext, useEffect, useRef, useState } from "@lukekaalim/act";
import { renderCanvasContext } from "../../three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
/*::
import type { Ref } from "@lukekaalim/act";
import type { Object3D } from "three";
*/

export const useTransformControls = (
  parentRef/*: Ref<?Object3D>*/,
  gizmoRef/*: Ref<?Object3D>*/,
  events/*: { onChange?: Object3D => mixed }*/ = { onChange: _ => {} },
  deps/*: mixed[]*/ = []
)/*: ?TransformControls*/ => {
  const render = useContext(renderCanvasContext);

  const [controls, setControls] = useState(null);
  useEffect(() => {
    if (!render)
      return;

    const { current: camera } = render.cameraRef;
    const { current: canvas } = render.canvasRef;
    const { current: parent } = parentRef;
    const { current: gizmo } = gizmoRef;

    if (!camera || !canvas || !parent || !gizmo)
      return; 
    const controls = new TransformControls(camera, canvas);
    parent.add(controls);
    controls.attach(gizmo);
    setControls(controls);
    return () => {
      controls.removeFromParent();
    };
  }, [render]);

  useEffect(() => {
    const { current: gizmo } = gizmoRef;
    if (!controls || !gizmo)
      return; 

    const onChange = (event) => {
      if (event.value)
        return;
        
      if (events.onChange)
        events.onChange(gizmo);
    }
    controls.addEventListener('dragging-changed', onChange);

    return () => {
      controls.removeEventListener('dragging-changed', onChange);
    }
  }, [controls, ...deps]);

  return controls;
};