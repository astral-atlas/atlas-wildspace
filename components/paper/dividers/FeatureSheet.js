// @flow strict

/*::
import type { Component } from '@lukekaalim/act';
*/
import { h } from "@lukekaalim/act";
import { FeatureDivider } from "../../dividers/box.js";
import classes from './FeatureSheet.module.css';

/*::
export type FeatureSheetProps = {
  style?: { scale?: number, ... }
};
*/

export const FeatureSheet/*: Component<FeatureSheetProps>*/ = ({
  children,
  style,
}) => {
  return h('div', { class: classes.featureSheet },
    h(FeatureDivider, { class: classes.border, style },
      children));
}