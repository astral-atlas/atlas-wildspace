// @flow strict
/*::
import type { MiniTheaterLocalState } from "../../miniTheater/useMiniTheaterController2";
import type { Component } from "@lukekaalim/act/component";
*/

import { h } from "@lukekaalim/act"
import styles from './miniTheater.module.css';

/*::
export type MiniTheaterLoadingProps = {
  state: MiniTheaterLocalState,
}
*/

export const MiniTheaterLoading/*: Component<MiniTheaterLoadingProps>*/ = ({
  state,
}) => {
  console.log(state.resources.loadingProgress);
  
  return h('div', { class: styles.loadingControl }, [
    h('progress', {
      class: styles.loadingControlBar,
      min: 0,
      max: 100,
      step: 1,
      value: state.resources.loadingProgress * 100
    })
  ])
}