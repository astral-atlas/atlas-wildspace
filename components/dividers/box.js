// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';

import dividerStyles from './dividers.module.css';
const styles = {
  beveled: dividerStyles.beveled,
  banner: dividerStyles.banner,
  square: dividerStyles.square,
  plain: dividerStyles.plain,
  feature: dividerStyles.feature,
};

export {
  styles as dividerStyles
}

/*::
export type StyleCustomizationProps = {|
  style?: {
    scale?: number,
    ...
  },
  class?: string,
  className?: string,
  classList?: string[],
|};

export type BoxDividerProps = {
  ...StyleCustomizationProps,
};
*/

export const BeveledDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.beveled, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { ...props, className, style: { ...style, '--scale': scale } }, props.children)
};
export const BannerDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.banner, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { ...props, className, style: { ...style, '--scale': scale } }, props.children)
};
export const SquareDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.square, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { ...props, className, style: { ...style, '--scale': scale } }, props.children)
};
export const PlainDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.plain, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { ...props, className, style: { ...style, '--scale': scale } }, props.children)
};
export const SkillSaveDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.skillSave, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { ...props, className, style: { ...style, '--scale': scale } }, props.children)
};
export const HealthDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.health, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { ...props, className, style: { ...style, '--scale': scale } }, props.children)
};
export const FeatureDivider/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.feature, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { ...props, className, style: { ...style, '--scale': scale } }, props.children)
};


export const SegmentedTop/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const classList = [dividerStyles.segmentedTop, props.class, props.className, ...(props.classList || [])];
  return h('div', { ...props, classList, style: { ...style, '--scale': scale } }, props.children)
};
export const SegmentedMiddle/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.segmentedMiddle, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { ...props, className, style: { ...style, '--scale': scale } }, props.children)
};
export const SegmentedBottom/*: Component<BoxDividerProps>*/ = (props) => {
  const { style: { scale = 1.5, ...style } = {} } = props;
  const className = [dividerStyles.segmentedBottom, props.class, props.className].filter(Boolean).join(' ');
  return h('div', { ...props, className, style: { ...style, '--scale': scale } }, props.children)
};


const BoxDivider/*: Component<{ ...BoxDividerProps, type: string }>*/ = ({
  type,
  children,
  style: { scale = 1.5, ...style } = {},
  classList = [],
  ...props
}) => {

  return h('div', {
    ...props,
    style: { ...style, ['--scale']: scale },
    classList: [...classList, dividerStyles[type]]
  }, children)
}

export const CopperCoinDivider/*: Component<BoxDividerProps>*/ = (props) =>
  h(BoxDivider, { ...props, type: 'copperCoin' }, props.children)

export const CoinLabelDivider/*: Component<BoxDividerProps>*/ = (props) =>
  h(BoxDivider, { ...props, type: 'coinLabel' }, props.children)