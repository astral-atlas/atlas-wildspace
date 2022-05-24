// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Vector3 } from "three";
import type { CubicBezierAnimation } from "@lukekaalim/act-curve";
*/

import { h, useContext, useEffect, useRef } from "@lukekaalim/act";
import { mesh } from "@lukekaalim/act-three";
import { MeshBasicMaterial } from "three";

import resourcesModelURL from './models/resources.glb';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { resourcesContext } from "./useResources";
import { useDisposable } from "@lukekaalim/act-three/hooks";
import {
  useAnimatedNumber,
  useBezierAnimation,
} from "@lukekaalim/act-curve";
import { useAnimatedVector2, useBezier2DAnimation } from "../animation/2d";

export const BoardCursor/*: Component<{ position: Vector3, entryAnim: CubicBezierAnimation }>*/ = ({ position, entryAnim }) => {
  const { cursorGeometry: geometry, texture } = useContext(resourcesContext);
  const material = useDisposable(() => {
    return new MeshBasicMaterial({ map: texture, transparent: true });
  }, [texture]);

  useBezierAnimation(entryAnim, point => {
    material.opacity = point.position * 0.8;
  }) 


  return h(mesh, { geometry, material, position });
}
