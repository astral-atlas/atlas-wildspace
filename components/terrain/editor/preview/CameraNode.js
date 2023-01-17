// @flow strict
/*::
import type {
  TerrainPropNode,
  TerrainPropNodes,
} from "../../../../models/game/miniTheater/terrain";
import type { TerrainEditorData } from "../../useTerrainEditorData";
import type { Component } from "@lukekaalim/act";
*/

import { CameraHelperComponent } from "../../../three/helpers";
import { h, useRef } from "@lukekaalim/act";
import { perspectiveCamera } from "@lukekaalim/act-three";

/*::
export type CameraNodeProps = {
  editor: TerrainEditorData,
  node: TerrainPropNodes["camera"]
}
*/

export const CameraNode/*: Component<CameraNodeProps>*/ = ({ editor, node }) => {
  const ref = useRef();
  return [
    h(perspectiveCamera, { ref }),
    h(CameraHelperComponent, { cameraRef: ref })
  ];
}