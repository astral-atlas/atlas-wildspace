// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
  MiniTheaterTool,
} from "../miniTheater/useMiniTheaterController2";
*/
import { h } from "@lukekaalim/act"
import styles from './SnackbarTerrainControlEdge.module.css';
import { EditorButton, EditorForm, EditorTextInput } from "../editor/form";

/*::
export type SnackbarTerrainControlEdgeProps = {
  controller: MiniTheaterController2,
  state: MiniTheaterLocalState,
};
*/

export const SnackbarTerrainControlEdge/*: Component<SnackbarTerrainControlEdgeProps>*/ = ({
  controller,
  state,
}) => {
  const selectedId = state.selection.type === 'terrain-prop' && state.selection.terrainId;
  const selectedTerrain = selectedId && state.miniTheater.terrain.find(t => t.id === selectedId) || null;
  const selectedProp = selectedTerrain && state.resources.terrainProps.get(selectedTerrain.terrainPropId);

  const onClickDeletePlacement = (terrain) => () => {
    controller.act({
      type: 'remote-action',
      remoteAction: {
        type: 'set-terrain',
        terrain: state.miniTheater.terrain.filter(t => t.id !== terrain.id)
      }
    })
  }

  return h('div', { class: styles.snackbarTerrainControlEdge }, [
    !!selectedTerrain && [
      h(EditorForm, {}, [
        h(GizmoControl, { controller, state }),
        h(EditorTextInput, { disabled: true, label: 'ID', text: selectedTerrain.id }),
        !!selectedProp && h(EditorTextInput, { disabled: true, label: 'Prop Name', text: selectedProp.name }),
        h(EditorButton, { label: 'Delete Terrain', onButtonClick: onClickDeletePlacement(selectedTerrain) })
      ]),
    ],
  ])
}

const gizmoLetterMap = {
  'none': 'N',
  'place': 'P',
  'translate': 'T',
  'rotate': 'R',
  'scale': 'S'
}

const GizmoButton = ({
  activeGizmo, gizmo, onGizmoChange
}) => {
  const onGizmoButtonClick = () => {
    onGizmoChange && onGizmoChange(gizmo);
  }

  return h('button', {
    disabled: activeGizmo.type === gizmo.type,
    onClick: onGizmoButtonClick,
  }, gizmoLetterMap[gizmo.type] || '?');
}

const GizmoControl = ({ state, controller }) => {
  const { tool } = state;
  const onGizmoChange = (tool/*: MiniTheaterTool*/) => {
    controller.act({ type: 'set-tool', tool })
  }
  return h('div', { class: styles.gizmoControl }, [
    h(GizmoButton, { gizmo: { type: 'place' }, activeGizmo: tool, onGizmoChange }),
    h(GizmoButton, { gizmo: { type: 'translate' }, activeGizmo: tool, onGizmoChange }),
    h(GizmoButton, { gizmo: { type: 'rotate' }, activeGizmo: tool, onGizmoChange }),
    h(GizmoButton, { gizmo: { type: 'scale' }, activeGizmo: tool, onGizmoChange }),
  ]);
}