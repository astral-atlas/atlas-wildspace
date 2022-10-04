// @flow strict

import { h, useEffect, useRef } from "@lukekaalim/act"
import { group } from "@lukekaalim/act-three"
import { useTransformControls } from "../../gizmos/useTransformControls";

/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { Object3D } from "three";
import type { MiniTheaterLocalState } from "../useMiniTheaterController2";
import type { RaycastManager } from "../../raycast/manager";

export type TerrainPlacementEditorProps = {
  parentRef: Ref<?Object3D>,
  miniTheaterState: MiniTheaterLocalState,
  onMoveTerrain?: Object3D => mixed,
  onMoveTerrainFinish?: Object3D => mixed,
  raycast?: ?RaycastManager,
};
*/


export const TerrainPlacementEditor/*: Component<TerrainPlacementEditorProps>*/ = ({
  parentRef,
  miniTheaterState,
  raycast,
  onMoveTerrain = _ => {},
  onMoveTerrainFinish = _ => {}
}) => {

  const getTransformControlForTool = () => {
    switch (miniTheaterState.tool.type) {
      case 'rotate':
      case 'translate':
      case 'scale':
        return miniTheaterState.tool.type;
      default:
        return null;
    }
  }
  const control = getTransformControlForTool()

  const controls = useTransformControls(parentRef, control || 'translate', !!control, {
    change(object) {
      onMoveTerrain(object);
    },
    changeFinish(object) {
      onMoveTerrainFinish(object)
    }
  }, [onMoveTerrain, miniTheaterState.tool])
  useEffect(() => {
    if (!raycast || !controls)
      return;
    return raycast.subscribe(controls, {});
  }, [raycast, controls])

  return null;
}