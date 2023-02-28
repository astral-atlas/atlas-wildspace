// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/
import { TreeEditorRow } from "./TreeEditorRow";
import { h, useState } from "@lukekaalim/act";
import styles from './TreeEditor.module.css';

/*::
export type TreeEditorNodeID = string;
export type TreeEditorNode = {
  id: TreeEditorNodeID,
  children: TreeEditorNode[],
};

type RenderNodeFunc = ({
  id: TreeEditorNodeID,
  depth: number,
  showExpanded: boolean,
  expanded: boolean,
  onExpandedChange: (expanded: boolean) => mixed
}) => ElementNode

export type TreeEditorProps = {
  renderNode: RenderNodeFunc,
  selectedNodes: Set<TreeEditorNodeID>,
  rootNodes: TreeEditorNode[],
};
*/

export const TreeEditor/*: Component<TreeEditorProps>*/ = ({
  rootNodes,
  selectedNodes,
  renderNode
}) => {
  return h('div', { class: styles.tree }, [
    h(NodeList, { nodes: rootNodes, selectedNodes, depth: 0, renderNode })
  ])
};

const NodeList = ({ nodes, depth = 0, renderNode }) => {
  return nodes.map(node => h(Node, { key: node.id, node, depth, renderNode }))
}

const Node = ({ node, depth, renderNode }) => {
  const [expanded, setExpanded] = useState(true);

  return [
    renderNode({
      id: node.id,
      depth,
      expanded,
      showExpanded: node.children.length > 0,
      onExpandedChange: expanded => setExpanded(expanded),
    }),
    !!expanded && h(NodeList, { nodes: node.children, depth: depth + 1, renderNode }),
  ]
}