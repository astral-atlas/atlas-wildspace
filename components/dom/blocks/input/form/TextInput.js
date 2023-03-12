// @flow strict

import { h } from "@lukekaalim/act";
import styles from './TextInput.module.css';

/*::
import type { Component } from "@lukekaalim/act";

export type TextInputProps = {
  text?: string,
  onTextChange?: (text: string) => mixed,
  onTextInput?: (text: string) => mixed,

  placeholder?: string,
  label?: string,
};
*/

export const TextInput/*: Component<TextInputProps>*/ = ({
  text = '',
  onTextChange = _ => {},
  onTextInput = _ => {},

  placeholder = '',
  label = null,
}) => {
  return h('label', { class: styles.textInput }, [
    !!label && h('span', { class: styles.textInputLabel }, label),
    h('input', {
      type: 'text',
      placeholder,
      value: text,
      onChange: e => onTextChange(e.target.value),
      onInput: e => onTextInput(e.target.value),
    })
  ])
};
