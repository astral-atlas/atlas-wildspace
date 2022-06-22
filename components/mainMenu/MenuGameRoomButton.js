// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/
import { h } from "@lukekaalim/act"
import { MenuGameButton } from "./MenuGameButton"
import styles from './MenuGameRoomButton.module.css';

/*::
export type MenuGameRoomButtonProps = {
  connections: number,
  roomName: string,
  onClick?: MouseEvent => mixed,
}
*/

export const MenuGameRoomButton/*: Component<MenuGameRoomButtonProps>*/ = ({
  connections,
  roomName,
  onClick,
}) => {
  return h(MenuGameButton, { onClick }, [
    h('div', { className: styles.roomButtonColumn }, [
      h('span', { className: styles.roomTitle }, roomName),
      connections > 0 && h('span', { className: styles.roomConnections }, `${connections} Connected`)
    ])
  ])
}