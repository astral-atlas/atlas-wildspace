// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';

import styles from './components.module.css';

/*::
export type ButtonProps = {
  type?: 'submit' | 'button',
  onClick?: () => mixed,
  className?: string,
}

export type TextInputProps = {
  className?: string,

  disabled?: boolean,
  value: string,
  label: string,
  onChange?: string => mixed,
  onInput?: string => mixed,
  placeholder?: string,
}
*/

export const CopperButton/*: Component<ButtonProps>*/ = ({ onClick, children, className, type }) => {
  return h('button', { className: [styles.copperButton, className].join(' '), onClick, type }, [
    h('div', { class: styles.hoverHighlight }),
    children,
  ]);
}

export const FeatureSection/*: Component<{ contentClassName?: string }>*/ = ({ contentClassName, children }) => {
  return h('section', { class: styles.featureContainer }, h('div', { class: [styles.featureContainerBorderReclaim, contentClassName].join(' ') }, children));
};

export const BackgroundBox/*: Component<{ className?: string }>*/ = ({ children, className }) => {
  return h('div', { class: [styles.backgroundBox, className].join(' ') }, h('div', { class: styles.backgroundBoxBorderReclaim }, children));
};

export const SmallTextInput/*: Component<TextInputProps>*/ = ({ className, disabled = false, value, label, onChange, onInput, placeholder }) => {
  return h('label', { className: [
    styles.smallTextInput,
    className
  ].filter(Boolean).join(' ')}, [
    h('span', { className: styles.smallTextInputLabelText,}, label),
    h('input', {
      className: styles.smallTextInputField,
      type: 'text',
      placeholder,
      onChange: e => onChange && onChange(e.target.value),
      onInput: e => onInput && onInput(e.target.value),
      value,
      disabled
    }),
  ])
}