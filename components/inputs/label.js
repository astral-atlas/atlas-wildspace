// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';
import { PlainDivider } from '../entry';

import inputStyles from './inputs.module.css';

/*::
export type LabelProps = {|
  label: string,
  style: { ... }
|};

export type PlainLabelProps = {
  ...LabelProps,
  style?: {
    ...LabelProps['style'],
    direction?: 'left' | 'above' | 'right' | 'below'
  }
}
*/

export const PlainLabel/*: Component<PlainLabelProps>*/ = ({ label, children, style: { direction = 'left', ...style } = {} }) => {
  const vertical = direction === 'above' || direction === 'below';
  const reverse = direction === 'right' || direction == 'below';
  return [
    h('label', { style: {
      ...style,
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      alignItems: reverse ? 'flex-end' : 'flex-start',
      textTransform: 'uppercase'
    } }, [
      h('span', { style: { fontSize: '12px', margin: '4px' } }, label),
      children,
    ])
  ];
};