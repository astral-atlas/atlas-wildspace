// @flow strict

import { h, useRef } from "@lukekaalim/act"
import { group } from "@lukekaalim/act-three"
import { useTransformControls } from "../controls/useTransformControls"

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
  const gizmoRef = useRef();

  useTransformControls(parentRef, gizmoRef, {
    onChange(object) {
      onMoveTerrain(object);
    }
  }, [onMoveTerrain])

  return h(group, { ref: gizmoRef });
}