// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/
import { h } from "@lukekaalim/act"
import { MenuGameButton } from "./MenuGameButton"
import styles from './MenuGamePrepButton.module.css';

import prepIconWhite from './prep_white_icon.png';
import prepIconBlack from './prep_black_icon.png';

/*::
export type MenuGamePrepButtonProps = {
  onClick?: MouseEvent => mixed,
}
*/

export const MenuGamePrepButton/*: Component<MenuGamePrepButtonProps>*/ = ({
  onClick
}) => {
  return h(MenuGameButton, { onClick }, [
    h('span', { className: styles.buttonRow }, [
      h('img', { src: prepIconWhite, className: styles.prepIcon }),
      h('span', { className: styles.spacing }),
      'Player Preparation' 
    ])
  ])
}