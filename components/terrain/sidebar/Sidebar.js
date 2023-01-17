// @flow strict
/*::
import type { TerrainEditorData } from "../useTerrainEditorData";
import type { Component } from "@lukekaalim/act";
*/

import { h, useState } from "@lukekaalim/act";
import { NodeTree } from "../snackbar/tree";
import { NodeDetails } from "./NodeDetails";

import styles from './Sidebar.module.css';

/*::
export type SidebarProps = {
  editor: TerrainEditorData,
}
*/

export const Sidebar/*: Component<SidebarProps>*/ = ({ editor }) => {
  const { state: { selectedNodeId }, nodeMap } = editor;

  const selectedNode = selectedNodeId && nodeMap.get(selectedNodeId) || null;

  return h('div', { class: styles.sidebar }, [
    h('div', { class: styles.tree }, [
      h(NodeTree, { editor }),
    ]),
    h('div', { class: styles.details }, [
      selectedNode && h(NodeDetails, { editor, node: selectedNode }),
    ]),
  ]);
};
