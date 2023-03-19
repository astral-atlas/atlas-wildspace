// @flow strict
/*::
import type {
  TreeGraphColumnNode,
  TreeGraphColumnNodeID,
} from "./TreeGraphColumn";
import type { Component } from "@lukekaalim/act";
*/

import { TreeGraphColumn } from "./TreeGraphColumn";
import styles from './TagBoxTreeColumn.module.css';
import { h, useMemo } from "@lukekaalim/act";
import { ExpandToggleInput } from "../input";

/*::
export type TagBoxTreeColumnProps = {
  rootNodes: TreeGraphColumnNode[],
  nodeDetails: Map<TreeGraphColumnNodeID, {
    color: string,
    title: string,
    tags: { color: string, title: string }[]
  }>,
  selectedNodeIds?: TreeGraphColumnNodeID[],
  onEvent?: (
    | { type: 'select', nodeId: TreeGraphColumnNodeID }
  ) => mixed,
};
*/

export const TagBoxTreeColumn/*: Component<TagBoxTreeColumnProps>*/ = ({
  rootNodes,
  nodeDetails,
  selectedNodeIds = [],
  onEvent = _ => {},
}) => {
  const renderNode = ({ depth, expanded, hidden, id, onExpandedChange, showExpanded }) => {
    const details = nodeDetails.get(id);
    if (!details)
      return null;

    return !hidden && h('div', {
      classList: [styles.row, selectedNodeIds.includes(id) && styles.selected],
      style: { paddingLeft: `${depth * 3}rem`}
    }, [
      showExpanded && h(ExpandToggleInput, { expanded, onExpandedChange }),
      h('button', {
        onClick: () => onEvent({ type: 'select', nodeId: id }),
        class: styles.box,
        style: {
          ['backgroundColor']: details.color
        },
      }, details.title),
      h('span', { class: styles.tagRow, },
        details.tags.map(tag => 
          h('span', { class: styles.tag, style: { 
            backgroundColor: tag.color
          } }, tag.title),
        )),
    ]);
  };

  return h('div', { class: styles.container }, h(TreeGraphColumn, {
    renderNode,
    rootNodes,
    class: styles.column,
    selectedNodes: new Set()
  }));
}