// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';
import fullscreenIconURL from './fullscreen.png';
import fullscreenWhiteIconURL from './fullscreen_white.png';

import styles from './FullscreenToggle.module.css';

/*::
type FullscreenToggleProps = {
  onFullscreenClick: () => mixed,
}
*/;

export const FullscreenToggle/*: Component<FullscreenToggleProps>*/ = ({ onFullscreenClick }) => {
  return h('button', { classList: [styles.fullscreenToggle], onClick: onFullscreenClick }, [
    h('img', { src: fullscreenWhiteIconURL })
  ])
}