// @flow strict

/*::
import type { Component } from "@lukekaalim/act";
*/
import styles from './FloatingOverlay.module.css';
import { h } from "@lukekaalim/act";

export const FloatingOverlay/*: Component<>*/ = ({
  children
}) => {
  return h('div', { class: styles.floatingOverlay }, children);
}