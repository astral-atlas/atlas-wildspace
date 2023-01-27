// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import styles from './MiniTheaterEditorOverlay.module.css';

/*::
export type MiniTheaterEditorOverlayProps = {
  toolbar?: ?ElementNode,
  sidebar?: ?ElementNode,
};
*/

export const MiniTheaterEditorOverlay/*: Component<MiniTheaterEditorOverlayProps>*/ = ({
  toolbar,
  sidebar
}) => {
  return h('div', { class: styles.overlayContainer }, [
    !!toolbar && h('div', { class: styles.toolbar }, toolbar),
    !!sidebar && h('div', { class: styles.sidebar }, sidebar),
  ]);
};