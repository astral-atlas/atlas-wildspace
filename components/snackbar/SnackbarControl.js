// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/
import { h } from '@lukekaalim/act';
import styles from './SnackbarControl.module.css';

/*::
export type SnackbarControlProps = {
  left: ElementNode,
  center: ElementNode,
  right: ElementNode,
}
*/

export const SnackbarControl/*: Component<SnackbarControlProps>*/ = ({
  left,
  center,
  right
}) => {
  return h('div', { class: styles.snackbarControl }, [
    h('div', { class: styles.snackbarLeftControl }, left),
    h('div', { class: styles.snackbarCenterControl }, center),
    h('div', { class: styles.snackbarRightControl }, right),
  ]);
};
