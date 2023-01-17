// @flow strict
/*::
import type { ReadOnlyRef } from "../useChildObject";
import type { Component } from "@lukekaalim/act/component";
import type { Camera, Quaternion, Vector3 } from "three";
*/
import { h, useEffect, useRef } from "@lukekaalim/act"
import { group } from "@lukekaalim/act-three"
import { CameraHelper } from 'three';

/*::
export type CameraHelperProps = {
  cameraRef: ReadOnlyRef<?Camera>
}
*/

export const CameraHelperComponent/*: Component<CameraHelperProps>*/ = ({ cameraRef }) => {
  const ref = useRef();
  useEffect(() => {
    const { current: parent } = ref
    const { current: camera } = cameraRef
    if (!parent || !camera)
      return null;
    const helper = new CameraHelper(camera)
    helper.matrixAutoUpdate = true;
    //helper.matrixWorldAutoUpdate = true;
    parent.add(helper);
  }, []);
  return h(group, { ref })
}
