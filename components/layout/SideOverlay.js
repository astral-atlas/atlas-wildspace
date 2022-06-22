// @flow strict

/*::
import type { Component } from "@lukekaalim/act/component";
*/
import { h } from "@lukekaalim/act";
import styles from './SideOverlay.module.css';

/*::
export type SideOverlayProps = {

};
*/
export const SideOverlay/*: Component<SideOverlayProps>*/ = ({ children }) => {
  return h('div', { classList: styles.sideOverlay }, children)
}