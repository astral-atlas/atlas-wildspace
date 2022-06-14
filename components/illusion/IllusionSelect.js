// @flow strict
/*::
import type { SelectEditorProps } from "../editor/form";
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act"
import styles from './Illusion.module.css';

export const IllusionSelect/*: Component<SelectEditorProps>*/ = ({
  onSelectedChange = _ => {},
  label,
  values = [],
  selected = null,
  ...props
}) => {
  const onChange = (event) => {
    onSelectedChange && onSelectedChange(event.target.value);
  }
  return h('label', { ...props, classList: [styles.illusion] }, [
    h('span', {}, label),
    h('select', { onChange }, values.map(({ title, value }) =>
      h('option', { key: value, value, selected: value === selected }, title || value)))
  ]);
}