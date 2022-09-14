// @flow strict


import { h } from "@lukekaalim/act"
import styles from './scene.module.css';

/*::
import type { Component } from "@lukekaalim/act";
*/

export const SceneContainer/*: Component<>*/ = ({ children }) => {
  return h('div', { class: styles.sceneContainer }, [
    children
  ])
}