// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/
import { TreeEditorRow } from "./TreeEditorRow";
import { h, useState } from "@lukekaalim/act";
import styles from './TreeEditor.module.css';

/*::
export type TreeEditorNodeID = string;
export type TreeEditorNode = {
  id: TreeEditorNodeID,
  name: string,
  children: TreeEditorNode[],
};

export type TreeEditorProps = {
  selectedNodes: Set<TreeEditorNodeID>,
  rootNodes: TreeEditorNode[],
};
*/

export const TreeEditor/*: Component<TreeEditorProps>*/ = ({ rootNodes, selectedNodes }) => {
  return h('div', { class: styles.tree }, [
    h(Branch, { nodes: rootNodes, selectedNodes })
  ])
};

const Branch = ({ nodes, selectedNodes }) => {
  return h('ol', { class: styles.branch }, nodes.map(node =>
    h('li', { class: styles.branchEntry }, [
      h(Leaf, { node, selectedNodes }),
    ])))  
};

const Leaf = ({ node, selectedNodes }) => {
  const [open, setOpen] = useState(true);
  const selected = selectedNodes.has(node.id);
  return [
    h('details', { class: styles.leaf, open: open ? "open" : null }, [
      h('summary', { class: styles.leafContainer }, [
        h('div', { class: styles.arrow }),
        h('span', { class: styles.leafDetails }, [
          h('button', { onClick: () => setOpen(!open) }, 'Hide children'), 
          h(TreeEditorRow, { title: node.name, selected })
        ]),
      ]),
      node.children.length > 0 &&
        h(Branch, { nodes: node.children, selectedNodes }),
    ])
  ];
};
