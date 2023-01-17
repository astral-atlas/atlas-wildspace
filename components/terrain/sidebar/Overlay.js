// @flow strict
/*::
import type { TerrainEditorData } from "../useTerrainEditorData";
import type { Component, Ref } from "@lukekaalim/act";
*/

import { Sidebar } from "./Sidebar";
import { h } from "@lukekaalim/act";
import styles from './Overlay.module.css';
import { Toolbar } from "./Toolbar";

/*::
export type OverlayProps = {
  editor: TerrainEditorData,
  cameraSurfaceRef: Ref<?HTMLElement>
};
*/

export const Overlay/*: Component<OverlayProps>*/ = ({ editor, cameraSurfaceRef }) => {
  return [
    h('div', { class: styles.toolbar }, [
      h(Toolbar, { editor, cameraSurfaceRef })
    ]),
    h('div', { class: styles.overlay }, [
      h(Sidebar, { editor })
    ])
  ];
};