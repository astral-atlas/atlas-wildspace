// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Vector3 } from "three";
import type { CubicBezierAnimation } from "@lukekaalim/act-curve";

import type { EncounterResources } from "../encounter/useResources";
import type { MiniTheaterController } from "./useMiniTheaterController";
*/

import { h, useContext, useEffect, useRef, useState } from "@lukekaalim/act";
import { mesh } from "@lukekaalim/act-three";
import { MeshBasicMaterial, AdditiveBlending } from "three";

import { useDisposable } from "@lukekaalim/act-three/hooks";
import {
  useAnimatedNumber,
  useBezierAnimation,
} from "@lukekaalim/act-curve";
import { useAnimatedVector2, useBezier2DAnimation } from "../animation/2d";

/*::
export type MiniTheaterCursorRendererProps = {
  controller: MiniTheaterController,
  resources: EncounterResources
}
*/

export const MiniTheaterCursorRenderer/*: Component<MiniTheaterCursorRendererProps>*/ = ({
  controller,
  resources
}) => {
  
  const { cursorGeometry: geometry, texture } = resources;
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  const material = useDisposable(() => {
    return new MeshBasicMaterial({
      map: texture,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
  }, [texture]);

  const [visibilityAnim] = useAnimatedNumber(visible ? 1 : 0, visible ? 1 : 0, { duration: 100, impulse: 3 })

  useBezierAnimation(visibilityAnim, point => {
    material.opacity = point.position * 0.8;
  })

  useEffect(() => {
    const { current: cursorMesh } = ref;
    if (!cursorMesh)
      return;

    return controller.subscribeCursor(cursor => {
      if (!cursor)
        return setVisible(false);

      setVisible(true);
      cursorMesh.position.set(
        cursor.position.x * 10,
        cursor.position.z * 10,
        cursor.position.y * 10
      )
    })
  }, [controller])


  return h(mesh, { geometry, material, ref });
}


const CursorMesh = ({ entryAnim, resources, controller }) => {
}