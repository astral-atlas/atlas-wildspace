// @flow strict
/*::
import type { TerrainEditorData } from "../../useTerrainEditorData";
import type { Component } from "@lukekaalim/act";
*/

import { NodeRow } from "./NodeRow";
import { h, useState } from "@lukekaalim/act";
import styles from './NodeTree.module.css';

/*::
export type NodeTreeProps = {
  editor: TerrainEditorData,
};
*/

export const NodeTree/*: Component<NodeTreeProps>*/ = ({ editor }) => {
  const { rootNodes } = editor.terrainProp;
  const nodes = rootNodes.map(id => editor.nodeMap.get(id)).filter(Boolean);

  const onAddNode = (nodeType) => {
    editor.dispatch({ type: 'add-node', parent: null, nodeType, title: 'Untitled Node' })
  };

  return h('div', { class: styles.root }, [
    h(NodeBranch, { nodes, editor }),
    h(AddChildrenControls, { editor, onAddNode })
  ]);
}

const NodeBranch = ({ nodes, editor }) => {
  return h('ol', { class: styles.branch }, nodes.map(node =>
    h('li', { class: styles.leaf }, h(NodeLeaf, { editor, node }))));
}

const NodeLeaf = ({ editor, node }) => {
  const [open, setOpen] = useState(true);
  const nodeIsSelected = node.meta.id === editor.state.selectedNodeId;

  switch (node.type) {
    default:
      return h(NodeRow, { editor, node });
    case 'transform':
      const nodes = node.children
        .map(id => editor.nodeMap.get(id))
        .filter(Boolean);
      const onAddNode = (nodeType) => {
        editor.dispatch({ type: 'add-node', parent: node.meta.id, nodeType, title: 'Untitled Node' })
      }
      
      return h('details', { open: open ? 'open' : null, onToggle: (e) => setOpen(e.target.open) }, [
        h('summary', { class: styles.leafDetailsSummary, }, h(NodeRow, { editor, node })),
        h('div', { class: styles.leafBranch }, [
          nodeIsSelected && h(AddChildrenControls, { onAddNode, editor }),
          h(NodeBranch, { nodes, editor }),
        ]),
      ]);
  }
}

const AddChildrenControls = ({ editor, onAddNode }) => {
  const onClickTransform = () => {
    onAddNode('transform')
  };
  return h('div', { class: styles.addChildrenControls }, [
    h('button', { onClick: onClickTransform }, '+ Transform'),
    h('button', { onClick: () => onAddNode('model') }, '+ Model'),
    h('button', { onClick: () => onAddNode('floor') }, '+ Floor'),
    h('button', { onClick: () => onAddNode('camera') }, '+ Camera'),
  ])
}