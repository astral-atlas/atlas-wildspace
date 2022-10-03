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
  const selected = state.selection.type === 'terrain-prop';

  return h('div', { class: styles.snackbarTerrainControlEdge }, [
    !!selected && h(GizmoControl, { controller, state })
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