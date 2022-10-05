// @flow strict
import { h } from "@lukekaalim/act";
import styles from './exposition.module.css';

/*::
import type { Component } from "@lukekaalim/act";

export type ExpositionColorProps = {
  color: string,
};
*/

export const ExpositionColor/*: Component<ExpositionColorProps>*/ = ({
  color,
}) => {
  return h('div', {
    class: styles.expositionColor,
    style: { backgroundColor: color }
  });
}

/*::
export type ExpositionColorEditorProps = {
  color: string,
  onColorChange: (color: string) => mixed,
};
*/

export const ExpositionColorEditor/*: Component<ExpositionColorEditorProps>*/ = ({
  color,
  onColorChange,
}) => {
  const onChange = (e) => {
    const nextColor = e.target.value;
    if (nextColor !== color)
      onColorChange(nextColor);
  }
  return h('label', {}, [
    h('input', {
      type: 'color',
      onChange,
      class: styles.expositionColorEditor,
      value: color
    })
  ]);
};
