// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
import { h, useRef } from '@lukekaalim/act';
import { points, useAnimationFrame, useDisposable } from "@lukekaalim/act-three";

import styles from './CornersLayout.module.css'
/*::
export type CornersLayoutProps = {
  topLeft?: ?ElementNode,
  topRight?: ?ElementNode,
  bottomLeft?: ?ElementNode,
  bottomRight?: ?ElementNode,
}
*/

export const CornersLayout/*: Component<CornersLayoutProps>*/ = ({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}) => {
  return [
    h('div', { classList: [styles.cornersLayout] }, [
      !!topLeft && h('div', { classList: [styles.top, styles.left] }, topLeft),
      !!topRight && h('div', { classList: [styles.top, styles.right] }, topLeft),
  
      !!bottomLeft && h('div', { classList: [styles.bottom, styles.left] }, bottomLeft),
      !!bottomRight && h('div', { classList: [styles.bottom, styles.right] }, bottomRight),
    ])
  ]
}