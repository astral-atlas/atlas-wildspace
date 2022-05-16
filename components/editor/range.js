// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type {  } from '@lukekaalim/act-curve'; */
/*::
import type {
  CubicBezier,
  CubicBezierAnimation,
} from "@lukekaalim/act-curve/bezier";
import type { Ref } from "@lukekaalim/act";
*/


import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import styles from './index.module.css';

/*::
export type EditorRangeInputProps = {
  label?: string,
  number: number,
  onNumberInput?: number => mixed,
  onNumberChange?: number => mixed,
  min?: number,
  max?: number,
  step?: number,
  disabled?: boolean
}
*/

export const EditorRangeInput/*: Component<EditorRangeInputProps>*/ = ({
  label,
  onNumberInput = _ => {},
  onNumberChange = _ => {},
  number,
  min = 0,
  max = 100,
  step = 0.1,
  disabled
}) => {

  return h('label', { classList: [styles.editorRoot] }, [
    h('span', {}, label),
    h('input', {
      type: 'range',
      min,
      max,
      step,
      value: number,
      onInput: e => onNumberInput(e.target.valueAsNumber),
      onChange: e => onNumberChange(e.target.valueAsNumber),
      disabled
    })
  ]);
}