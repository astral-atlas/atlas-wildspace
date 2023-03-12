// @flow strict

import { h } from "@lukekaalim/act";
import styles from './OutputPresenter.module.css'

/*::
import type { Component } from "@lukekaalim/act";

export type OutputPresenterProps = {
  outputs: string[],
};
*/

export const OutputPresenter/*: Component<OutputPresenterProps>*/ = ({
  outputs
}) => {
  return h('pre', { class: styles.output }, outputs.join('\n'))
};
