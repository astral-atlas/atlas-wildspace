// @flow strict
/*::
import type { TreeGraphColumnNode } from "./TreeGraphColumn";
import type { Component } from "@lukekaalim/act";
*/

import { TreeGraphColumn } from "./TreeGraphColumn";
import styles from './TagBoxTreeColumn.module.css';
import { h, useMemo } from "@lukekaalim/act";
import { ExpandToggleInput } from "../input";

/*::
export type TaggedNodeID = string;
export type TaggedNode = {
  id: TaggedNodeID,
  children: TaggedNode[],
  color: string,
  tags: { title: string, color: string }[],
}

export type TagBoxTreeColumnProps = {
  rootNodes: TreeGraphColumnNode[],
  selected: null | TaggedNodeID,
};
*/

export const TagBoxTreeColumn/*: Component<TagBoxTreeColumnProps>*/ = ({
  rootNodes,
  selected
}) => {
  const renderNode = useMemo(() => ({ depth, expanded, hidden, id, onExpandedChange, showExpanded }) => {
    return !hidden && h('div', { class: styles.boxNode }, [
      showExpanded && h(ExpandToggleInput, { expanded, onExpandedChange }),
      h('button', {
        class: styles.objectName,
        onClick,
        style: {
          ['--name-color']: `hsl(${hash(object.name) % 360}deg, 20%, 80%)` } },
          object.name),
      h('span', {
        class: styles.objectTagColumn,
      }, [
        h('span', { class: styles.objectTag, style: { 
          backgroundColor: `hsl(${hash(object.type) % 360}deg, 50%, 50%)` } }, object.type),
      ]),
      nodeParts.map(part =>
        h('span', { class: styles.objectTagColumn }, [
          h('span', { class: styles.objectTag, style: { 
            backgroundColor: `hsl(${hash(part.id) % 360}deg, 50%, 50%)` } }, part.title),
        ])
      ),
    ]);
  }, []);

  return h(TreeGraphColumn, {
    renderNode,
    rootNodes,
    selectedNodes: new Set()
  });
}