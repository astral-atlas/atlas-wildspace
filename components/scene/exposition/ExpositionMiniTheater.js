// @flow strict

import { h } from "@lukekaalim/act";
import { perspectiveCamera } from "@lukekaalim/act-three";
import { RenderCanvas } from "../../three/RenderCanvas";
import { miniVectorToThreeVector } from "../../utils";

/*::
import type { Component } from "@lukekaalim/act/component";
import type {
  ExpositionBackground,
  MiniQuaternion,
  MiniVector,
  MiniTheater,
} from "@astral-atlas/wildspace-models";
import { miniQuaternionToThreeQuaternion } from "../../utils/miniVector";
import { MiniTheaterScene2 } from "../../miniTheater/MiniTheaterScene2";

export type ExpositionMiniTheaterProps = {
  miniTheater: MiniTheater,
  position: MiniVector,
  rotation: MiniQuaternion
};
*/

export const ExpositionMiniTheater/*: Component<ExpositionMiniTheaterProps>*/ = ({
  miniTheater,
  position,
  rotation,
}) => {
  return h(RenderCanvas, {}, [
    h(MiniTheaterScene2, { miniTheater }),
    h(perspectiveCamera, {
      position: miniVectorToThreeVector(position),
      quaternion: miniQuaternionToThreeQuaternion(rotation)
    })
  ])
}