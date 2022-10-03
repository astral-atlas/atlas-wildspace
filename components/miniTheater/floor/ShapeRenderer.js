// @flow strict

import { h, useEffect } from "@lukekaalim/act";
import { lineSegments, mesh, useDisposable } from "@lukekaalim/act-three";
import {
  AdditiveBlending,
  BoxGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  MeshBasicMaterial,
} from "three";
import {
  miniQuaternionToThreeQuaternion,
  miniVectorToThreeVector,
} from "../../utils/miniVector";

/*::
import type { RaycastManager } from "../../raycast/manager";
import type { MiniTheaterShape } from "@astral-atlas/wildspace-models";
import type { Component, Ref } from "@lukekaalim/act";
import type { Color, LineSegments, Object3D } from "three";
*/

/*::
export type ShapeRendererProps = {
  shape: MiniTheaterShape,
  material?: LineBasicMaterial,
  ref?: Ref<?Object3D>
}
*/

const unitBox = new BoxGeometry(1, 1, 1);
const lines = new EdgesGeometry(unitBox);
const fallbackMaterial = new LineBasicMaterial();
const solidMaterial = new MeshBasicMaterial({ transparent: true, opacity: 0.2, depthWrite: false })

export const ShapeRenderer/*: Component<ShapeRendererProps>*/ = ({
  shape,
  ref,
  material = fallbackMaterial,
}) => {

  const position = miniVectorToThreeVector(shape.position);
  const quaternion = miniQuaternionToThreeQuaternion(shape.rotation);
  const scale = miniVectorToThreeVector(shape.size);

  return [
    h(lineSegments, {
      position,
      quaternion,
      scale,
      geometry: lines,
      material,
    }),
    h(mesh, {
      position,
      quaternion,
      scale,
      ref,
      material: solidMaterial,
      geometry: unitBox
    })
  ];
}