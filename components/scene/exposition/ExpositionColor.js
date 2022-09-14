// @flow strict
import { h } from "@lukekaalim/act";
import styles from './exposition.module.css';

/*::
import type { Component } from "@lukekaalim/act";

export type ExpositionColorProps = {
  color: string,
};
*/

export const ExpositionColor/*: Component<ExpositionColorProps>*/ = ({ color }) => {
  return h('div', {
    class: styles.expositionColor,
    style: { backgroundColor: color }
  });
}