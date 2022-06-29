// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act"
import styles from './MiniVolumeControl.module.css';

import volumeLoudURL from './volume_loud_white.svg';
import volumeMuteURL from './volume_mute_white.svg';

/*::
export type MiniVolumeControlProps = {
  volume: number,
  onVolumeInput?: number => mixed,
}
*/

export const MiniVolumeControl/*: Component<MiniVolumeControlProps>*/ = ({ volume, onVolumeInput = _ => {} }) => {
  const onInput = (e) => {
    onVolumeInput(e.target.valueAsNumber)
  }

  return h('div', { className: styles.miniVolumeControl }, [
    h('img', { src: volume === 0 ? volumeMuteURL : volumeLoudURL }),
    h('label', { className: styles.miniVolumeControlLabel }, [
      h('span', {}, 'Music'),
      h('input', { type: 'range', min: 0, max: 1, step: 0.0001, value: volume, onInput })
    ])
  ])
}