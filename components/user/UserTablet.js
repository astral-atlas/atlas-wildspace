// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { User } from "@astral-atlas/sesame-models"; */

import { h } from "@lukekaalim/act";

import styles from './UserTablet.module.css';
import { useAnimatedList } from "@lukekaalim/act-curve/array";


/*::
export type UserTabletProps = {
  name?: string,
  sesameURL: URL,
  onLogoutClick?: () => mixed,
};
*/

export const UserTablet/*: Component<UserTabletProps>*/ = ({
  name,
  sesameURL,
  onLogoutClick = _ => {}
}) => {

  return h('div', { classList: [styles.userTablet] }, [
    h('a', { href: sesameURL }, name),
    ' (',
    h('button', { classList: [styles.userTabletLogoutButton], onClick: onLogoutClick }, 'logout'),
    ') '
  ])
};

/*::
export type AnimatedUserTabletProps = {
  user: ?User,
  sesameURL: URL,
  onLogoutClick?: () => mixed,
};
*/
export const AnimatedUserTablet = () => {

}