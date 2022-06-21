// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import styles from './MenuGameButton.module.css';

/*::
export type MenuGameButtonProps = {
  label?: string,
  onClick?: MouseEvent => mixed,
}
*/

export const MenuGameButton/*: Component<MenuGameButtonProps>*/ = ({
  label = null,
  children,
  onClick
}) => {
  return h('button', { className: styles.menuGameButton, onClick }, [label, children])
};
