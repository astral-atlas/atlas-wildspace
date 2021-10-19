// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';
import { PlainDivider } from '../entry';

import inputStyles from './inputs.module.css';

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
export type NumberInputProps = {|
  ...StyleCustomizationProps,
  ...LabeledInputProps<number>,
  min?: number,
  max?: number,
|}
*/

export const InspirationInput/*: Component<NumberInputProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {}, onChange = _ => {}, onInput = _ => {}, disabled } = props;
  const getValue = e => e.target.valueAsNumber;
  const className = [inputStyles.inspiration, props.class, props.className].filter(Boolean).join(' ');
  return [
    h('label', { className, style: { '--scale': scale } }, [
      h('span', {}, props.label || props.children),
      h('input', {
        type: 'number',
        value: props.value,
        disabled,
        onChange: e => onChange(getValue(e)),
        onInput: e => onInput(getValue(e)),
        min: props.min,
        max: props.max
      })
    ])
  ]
}
export const ProficiencyInput/*: Component<NumberInputProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {}, onChange = _ => {}, onInput = _ => {}, disabled } = props;
  const getValue = e => e.target.valueAsNumber;
  const className = [inputStyles.proficency, props.class, props.className].filter(Boolean).join(' ');
  return [
    h('label', { className, style: { '--scale': scale } }, [
      h('span', {}, props.label || props.children),
      h('input', {
        disabled,
        type: 'number',
        value: props.value,
        onChange: e => onChange(getValue(e)),
        onInput: e => onInput(getValue(e)),
        min: props.min,
        max: props.max
      })
    ])
  ]
}
export const PassiveInput/*: Component<NumberInputProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {}, onChange = _ => {}, onInput = _ => {} } = props;
  const getValue = e => e.target.valueAsNumber;
  const className = [inputStyles.passive, props.class, props.className].filter(Boolean).join(' ');
  return [
    h('label', { className, style: { ...style, '--scale': scale } }, [
      h('span', {}, props.label || props.children),
      h('input', {
        type: 'number',
        value: props.value,
        onChange: e => onChange(getValue(e)),
        onInput: e => onInput(getValue(e)),
        min: props.min,
        max: props.max
      })
    ])
  ]
}


export const ArmorInput/*: Component<NumberInputProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {}, onChange = _ => {}, onInput = _ => {} } = props;
  const getValue = e => e.target.valueAsNumber;
  const className = [inputStyles.armor, props.class, props.className].filter(Boolean).join(' ');
  return [
    h('label', { className, style: { ...style, '--scale': scale } }, [
      h('span', {}, props.label || props.children),
      h('input', {
        type: 'number',
        value: props.value,
        onChange: e => onChange(getValue(e)),
        onInput: e => onInput(getValue(e)),
        min: props.min,
        max: props.max
      })
    ])
  ];
}

export const PlainNumberInput/*: Component<NumberInputProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {}, onChange = _ => {}, onInput = _ => {}, disabled } = props;
  const getValue = e => e.target.valueAsNumber;
  const className = [inputStyles.plain, props.class, props.className].filter(Boolean).join(' ');
  return [
    h(PlainDivider, { scale, style },
      h('input', {
        type: 'number',
        disabled,
        className,
        value: props.value,
        onChange: e => onChange(getValue(e)),
        onInput: e => onInput(getValue(e)),
        min: props.min,
        max: props.max
      })
    ),
  ]
}