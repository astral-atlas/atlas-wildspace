// @flow strict

import { h, useState } from "@lukekaalim/act";
import styles from './PreviewSidebarLayout.module.css';

/*::
import type { Component, ElementNode, Ref } from "@lukekaalim/act";
import type { Object3D } from "three";
import type {
  ModelResource,
  ModelResourcePart,
} from "@astral-atlas/wildspace-models";

export type PreviewSidebarLayoutProps = {
  preview: ElementNode,
  topPane: ElementNode,
  bottomPane: ElementNode,
};
*/

export const PreviewSidebarLayout/*: Component<PreviewSidebarLayoutProps>*/ = ({
  preview,
  topPane,
  bottomPane,
}) => {
  const [] = useState()

  return h('div', { class: styles.container }, [
    h('div', { class: styles.preview },
      preview),
    h('div', { class: styles.pane }, [
      h('div', { class: styles.top }, topPane),
      h('div', { class: styles.bottom }, bottomPane),
    ]),
  ]);
}