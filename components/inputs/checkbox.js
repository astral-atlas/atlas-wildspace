// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';
import { PlainDivider } from '../entry';

import inputStyles from './inputs.module.css';

/*::
export type CircleCheckboxInputProps = {
  value?: boolean,
  disabled?: boolean,
  onChange?: boolean => mixed,
  onInput?: boolean => mixed,
  style?: { scale?: number, ... },
};
*/

export const CircleCheckboxInput/*: Component<CircleCheckboxInputProps>*/ = ({
  value = false,
  disabled = false,
  onChange = _ => {},
  onInput = _ => {},
  style: { scale = 1.5, ...style } = {}
}) => {
  return h('input', {
    style: { ...style, '--scale': scale },
    className: inputStyles.circle,
    type: 'checkbox',
    checked: value,
    disabled,
    onChange: e => onChange(e.target.checked),
    onInput: e => onInput(e.target.checked),
  })
};