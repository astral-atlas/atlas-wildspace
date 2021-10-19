// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';

import dividerStyles from './dividers.module.css';

/*::
export type StyleCustomizationProps = {|
  style?: {
    scale?: number,
    ...
  },
  class?: string,
  className?: string,
|};

export type BoxDividerProps = {
  ...StyleCustomizationProps,
};
*/

export const BeveledDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.beveled, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { className, style: { ...style, '--scale': scale } }, props.children)
};
export const BannerDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.banner, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { className, style: { ...style, '--scale': scale } }, props.children)
};
export const SquareDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.square, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { className, style: { ...style, '--scale': scale } }, props.children)
};
export const PlainDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.plain, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { className, style: { ...style, '--scale': scale } }, props.children)
};
export const SkillSaveDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.skillSave, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { className, style: { ...style, '--scale': scale } }, props.children)
};
export const HealthDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.health, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { className, style: { ...style, '--scale': scale } }, props.children)
};
export const FeatureDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.feature, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { className, style: { ...style, '--scale': scale } }, props.children)
};


export const SegmentedTop/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.segmentedTop, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { className, style: { ...style, '--scale': scale } }, props.children)
};
export const SegmentedBottom/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.segmentedBottom, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { className, style: { ...style, '--scale': scale } }, props.children)
};