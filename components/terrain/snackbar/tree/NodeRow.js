// @flow strict
/*::
import type { TerrainEditorData } from "../../useTerrainEditorData";
import type { TerrainPropNode } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import styles from './NodeRow.module.css';

/*::
export type NodeRowProps = {
  node: TerrainPropNode,
  editor: TerrainEditorData,
};
*/

export const NodeRow/*: Component<NodeRowProps>*/ = ({ node, editor }) => {
  const isSelected = editor.state.selectedNodeId === node.meta.id;
  const onSelectInput = (event/*: Event*/) => {
    const { target } = event;
    if (target instanceof HTMLInputElement && !target.checked)
      editor.dispatch({ type: 'select', nodePath: node.meta.path })
    else
      editor.dispatch({ type: 'deselect' })
  }
  const onRowClick = (event/*: MouseEvent*/) => {
    event.preventDefault()
    editor.dispatch({ type: 'select', nodePath: node.meta.path })
  }

  return h('span', { class: styles.row, onClick: onRowClick }, [
    h('input', { class: styles.selected, type: 'radio', checked: isSelected, onInput: onSelectInput }),
    ' ',
    h('span', { class: styles.nameContainer, type: 'text' }, h('span', { class: styles.name }, node.meta.name || 'Untitled Node')),
    ' ',
    h('div', { class: styles.tagContainer },
      h('span', { class: styles.type, }, node.type)),
  ]);
};
