// @flow strict
/*::
import type { Component } from "@lukekaalim/act";

import type { SnackbarTerrainControlEdgeProps } from "./SnackbarTerrainControlEdge";
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "../miniTheater/useMiniTheaterController2";
*/

import { h } from "@lukekaalim/act";
import { SnackbarTerrainControlEdge } from "./SnackbarTerrainControlEdge";
import { SnackbarControl } from "./SnackbarControl";
import { repeat } from "@astral-atlas/wildspace-test";
import { SnackbarLayerControlEdge } from "./SnackbarLayerControlEdge";
import { SnackbarPlacementControlCenter } from "./SnackbarPlacementControlCenter";

const TerrainList = () => {
  return repeat(() => h('button', { class: 'alpha' }, 'Terrain'), 10)
}

/*::
export type MiniTheaterSnackbarControlProps = {
  controller: MiniTheaterController2,
  state: MiniTheaterLocalState,
};
*/

export const MiniTheaterSnackbarControl/*: Component<MiniTheaterSnackbarControlProps>*/ = ({
  controller,
  state
}) => {
  return h(SnackbarControl, {
    left: h(SnackbarTerrainControlEdge, { controller, state }),
    center: h(SnackbarPlacementControlCenter, { controller, state }),
    right: h(SnackbarLayerControlEdge, { controller, state })
  })
};