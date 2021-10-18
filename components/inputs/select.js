// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';
import { PlainDivider } from '../entry.js';
import inputStyles from './inputs.module.css';

/*::
export type PlainSelectInputProps<T> = {
  options?: { label: string, value: T }[],
  onChange?: T => mixed,
  value?: ?T,
};
*/

export const PlainSelectInput = /*:: <T>*/({
  options = [],
  onChange = _ => {},
  value = null
}/*: PlainSelectInputProps<T>*/)/*: ElementNode*/ => {
  return [
    h(PlainDivider, { className: inputStyles.plain, style: { display: 'inline-block' } }, [
      h('select', {
        onChange: e => onChange(e.target.value),
        value
      }, [
        ...options.map(op => h('option', { value: op.value, selected: op.value === value }, op.label))
      ])
    ]),
  ]
};