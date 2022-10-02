// @flow strict

import { h, useRef } from "@lukekaalim/act"
import { group } from "@lukekaalim/act-three"
import { useTransformControls } from "../../gizmos/useTransformControls";

/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { Object3D } from "three";

export type TerrainPlacementEditorProps = {
  parentRef: Ref<?Object3D>,
  onMoveTerrain?: Object3D => mixed,
};
*/


export const TerrainPlacementEditor/*: Component<TerrainPlacementEditorProps>*/ = ({
  parentRef,
  onMoveTerrain = _ => {},
}) => {
  useTransformControls(parentRef, 'rotate', {
    change(object) {
      //console.log('change')
      onMoveTerrain(object);
    }
  }, [onMoveTerrain])

  return null;
}