// @flow strict

import { h } from "@lukekaalim/act";
import styles from './index.module.css';

/*::
import type { Component } from "@lukekaalim/act";

export type ColorEditorProps = {
  label?: string,
  color?: string,
  onColorChange?: string => mixed,
  disabled?: boolean,
};
*/

export const ColorEditor/*: Component<ColorEditorProps>*/ = ({
  label = 'Color',
  color = '#ffffff',
  onColorChange,
  disabled = false,
}) => {
  const onChange = (e) => {
    if (onColorChange)
      onColorChange(e.target.value)
  }
  return h('label', { classList: [styles.editorRoot] }, [
    h('span', {}, label),
    h('input', { type: 'color', value: color, onChange, disabled })
  ]);
};
