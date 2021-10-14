// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';

import inputStyles from './inputs.module.css';
import { PlainDivider } from "../dividers/box";

/*::
export type StyleCustomizationProps = {|
  style?: {
    scale?: number,
    ...
  },
  class?: string,
  className?: string,
|};

export type InputProps<T> = {|
  value?: T,
  disabled?: boolean,
  onChange?: (value: T) => mixed,
  onInput?: (value: T) => mixed,
|};

export type LabeledInputProps<T> = {|
  ...InputProps<T>,
  label?: ElementNode,
|};
*/

/*::
export type TextInputProps = {|
  ...StyleCustomizationProps,
  ...LabeledInputProps<string>,
|}
*/

export const BrandedTextInput/*: Component<TextInputProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {}, onChange = _ => {}, onInput = _ => {} } = props;
  const getValue = e => e.target.value;
  const className = [inputStyles.branded, props.class, props.className].filter(Boolean).join(' ');
  return [
    h('input', {
      className,
      type: 'text',
      value: props.value || '',
      style: { ...style, '--scale': scale },
      onChange: e => onChange(getValue(e)),
      onInput: e => onInput(getValue(e)),
    })
  ]
}
export const PlainTextInput/*: Component<TextInputProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {}, onChange = _ => {}, onInput = _ => {} } = props;
  const getValue = e => e.target.value;
  const className = [inputStyles.plain, props.class, props.className].filter(Boolean).join(' ');
  return [
    h(PlainDivider, { scale },
      h('input', {
        className,
        type: 'text',
        value: props.value || '',
        style: { ...style, '--scale': scale },
        onChange: e => onChange(getValue(e)),
        onInput: e => onInput(getValue(e)),
      })
    ),
  ]
}