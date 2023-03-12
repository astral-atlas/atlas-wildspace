// @flow strict

/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/
import { h, useState } from "@lukekaalim/act";
import styles from './TreeGraphColumn.module.css';

/*::
export type TreeGraphColumnNodeID = string;
export type TreeGraphColumnNode = {
  id: TreeGraphColumnNodeID,
  children: TreeGraphColumnNode[],
};

type RenderNodeFunc = ({
  hidden: boolean,
  id: TreeGraphColumnNodeID,
  depth: number,
  showExpanded: boolean,
  expanded: boolean,
  onExpandedChange: (expanded: boolean) => mixed
}) => ElementNode

export type TreeGraphColumnProps = {
  renderNode: RenderNodeFunc,
  selectedNodes: Set<TreeGraphColumnNodeID>,
  rootNodes: TreeGraphColumnNode[],
};
*/

export const TreeGraphColumn/*: Component<TreeGraphColumnProps>*/ = ({
  rootNodes,
  selectedNodes,
  renderNode
}) => {
  return h('div', { class: styles.tree }, [
    h(NodeList, { nodes: rootNodes, selectedNodes, depth: 0, renderNode, hidden: false })
  ])
};

const NodeList = ({ nodes, depth = 0, renderNode, hidden }) => {
  return nodes.map(node => h(Node, { key: node.id, node, depth, renderNode, hidden }))
}

const Node = ({ node, depth, renderNode, hidden }) => {
  const [expanded, setExpanded] = useState(true);

  return [
    renderNode({
      hidden,
      id: node.id,
      depth,
      expanded,
      showExpanded: node.children.length > 0,
      onExpandedChange: expanded => setExpanded(expanded),
    }),
    h(NodeList, {
      nodes: node.children,
      depth: depth + 1,
      renderNode,
      hidden: hidden || !expanded
    }),
  ]
}