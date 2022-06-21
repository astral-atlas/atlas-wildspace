// @flow strict
/*::
import type { Component } from "@lukekaalim/act/component";
*/

import { h } from "@lukekaalim/act"
import styles from './ScreenSelector.module.css';
import viewportIconURL from './viewport_icon.svg';

/*::
export type ScreenSelectorProps = {
  screen: string,
  screens: string[],
  onScreenChange?: string => mixed,
}
*/
export const ScreenSelector/*: Component<ScreenSelectorProps>*/ = ({ screen, screens, onScreenChange = _ => {} }) => {
  return h('div', { className: styles.screenSelector }, [
    h('img', { src: viewportIconURL }),
    h('div', { className: styles.hoverHidden }, [
      h('select', {
        className: styles.screenSelect,
        onInput: e => onScreenChange(e.target.value),
      }, screens.map(s => h('option', { selected: screen === s }, s)))
    ])
  ])
}