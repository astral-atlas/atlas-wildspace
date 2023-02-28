// @flow strict

import { h, useState } from "@lukekaalim/act"
import styles from './blocks.module.css';
/*::
import type { Component } from "@lukekaalim/act";
*/

/*::
export type FillBlockProps = {
  color?: string,
  label?: string,
}
*/
export const FillBlock/*: Component<FillBlockProps>*/ = ({ color, label, children }) => {
  const [randomColor] = useState(() => `hsl(${Math.floor(Math.random() * 360)}deg, 50%, 50%)`)

  const labelElement = children || label;

  return h('div', {
    class: styles.fillBlock,
    style: { backgroundColor: color || randomColor }
  }, labelElement && h('div', { class: styles.fillBlockLabel }, labelElement));
}