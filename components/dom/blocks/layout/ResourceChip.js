// @flow strict

import { h, useMemo } from "@lukekaalim/act";
import stringHash from "@sindresorhus/string-hash";
import { nanoid } from 'nanoid/non-secure';
import styles from './ResourceChip.module.css';
import { TagDropdown } from "../../../library/editor/tags/TagDropdown";
import { TagRowInput } from "../input";

/*::
import type { Component, ElementNode } from "@lukekaalim/act";
import type { Tag, TagID } from '@astral-atlas/wildspace-models';
import type { TagRowInputProps } from "../input/TagRowInput";

export type ResourceChipProps = {
  id: string,
  version?: string,
}
*/

export const ResourceChip/*: Component<ResourceChipProps>*/ = ({
  id = '',
  version = null,
  children,
}) => {
  const style = {
    ['--id-hash-color']: `hsl(${stringHash(id) % 360}deg, 50%, 80%)`,
    ['--version-hash-color']: `hsl(${stringHash(version) % 360}deg, 50%, 80%)`,
  }
  return h('div', { class: styles.resourceChip, style }, [
    h(ResourceChipInlineRow, { fields: [
      { key: 'id', value: id },
      version && { key: 'version', value: version } || null,
    ].filter(Boolean) }),
    children,
  ]);
};

/*::
export type ResourceChipInlineRowProps = {
  fields: { key: string, value: string }[],
}
*/

export const ResourceChipInlineRow/*: Component<ResourceChipInlineRowProps>*/ = ({ fields }) => {
  return h('div', { class: styles.resourceMetaRow }, fields.map(field => {
    return h('span', { class: styles.resourceInlineEntry }, [
      h('span', { class: styles.key }, field.key),
      h('span', { class: styles.value }, field.value)
    ]);
  }));
}

export const ResourceChipDivider/*: Component<>*/ = () => {
  return h('hr', { class: styles.divider });
}

/*::
export type ResourceChipLabelProps = {
  label: string,
};
*/

export const ResourceChipLabel/*: Component<ResourceChipLabelProps>*/ = ({
  children,
  label,
}) => {
  return h('label', { class: styles.labelContainer }, [
    h('div', { class: styles.label }, label),
    h('div', { class: styles.controller }, children)
  ]);
}

/*::
export type ResourceChipActionRowProps = {
  actions: { title: string, onAction?: () => mixed }[],
};
*/

export const ResourceChipActionRow/*: Component<ResourceChipActionRowProps>*/ = ({
  actions,
}) => {
  return h('div', { class: styles.actionRow }, actions.map(action =>
    h('button', { class: styles.action, onClick: action.onAction }, action.title)
  ));
}

export const ResourceChipTagRow/*: Component<TagRowInputProps>*/ = (props) => {
  return h('div', { class: styles.tagRow },
    h(TagRowInput, props));
}


/*::
export type ResourceChipsetProps = {
  chips: ElementNode[]
}
*/

export const ResourceChipset/*: Component<ResourceChipsetProps>*/ = ({
  chips
}) => {
  return h('ol', { class: styles.chipset },
    chips.map(chip =>
      h('li', {}, chip)))
}