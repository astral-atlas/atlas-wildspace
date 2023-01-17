// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import styles from './MiniTheaterOverlay.module.css';

/*::
export type MiniTheaterOverlayProps = {
  toolbar?: ?ElementNode,
  sidebar?: ?ElementNode,
};
*/

export const MiniTheaterOverlay/*: Component<MiniTheaterOverlayProps>*/ = ({
  toolbar,
  sidebar
}) => {
  return h('div', { class: styles.overlayContainer }, [
    !!toolbar && h('div', { class: styles.toolbar }, toolbar),
    !!sidebar && h('div', { class: styles.sidebar }, sidebar),
  ]);
};