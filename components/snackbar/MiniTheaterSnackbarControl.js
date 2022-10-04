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
import { EditorButton, EditorForm } from "../editor/form";

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
  const pieceId = state.selection.type === 'piece' && state.selection.pieceId;
  const terrainId = state.selection.type === 'terrain-prop' && state.selection.terrainId;
  return h(SnackbarControl, {
    left: [
      terrainId && h(SnackbarTerrainControlEdge, { controller, state }),
      pieceId && h(PieceControls, { controller, state, pieceId })
    ],
    center: h(SnackbarPlacementControlCenter, { controller, state }),
    right: h(SnackbarLayerControlEdge, { controller, state })
  })
};

const PieceControls = ({ controller, state, pieceId }) => {
  const onDeleteButtonClick = () => {
    controller.act({ type: 'remote-action', remoteAction: { type: 'remove-piece', removedPiece: pieceId } })
  }
  return h(EditorForm, {}, [
    h(EditorButton, { label: 'Delete Piece', onButtonClick: onDeleteButtonClick })
  ])
}