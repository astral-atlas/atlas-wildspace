// @flow strict
/*::
import type { GameMeta } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
*/
import { TextInput } from "./form/TextInput";
import { h } from "@lukekaalim/act";
import styles from './ResourceMetaInput.module.css';

/*::
export type ResourceMetaInputProps = {
  meta: { ...GameMeta<string>, ... },
  onMetaInput?: GameMeta<string> => mixed,
};
*/

export const ResourceMetaInput/*: Component<ResourceMetaInputProps>*/ = ({
  meta,
  onMetaInput,
}) => {
  return h('div', { class: styles.resourceMetaInput }, [
    h('div', { class: styles.propertyGroup }, [
      h('div', { class: styles.readonlyProperty }, [
        h('div', { class: styles.key }, 'GameID'),
        h('div', { class: styles.value }, meta.gameId),
      ]),
      h('div', { class: styles.readonlyProperty }, [
        h('div', { class: styles.key }, 'ID'),
        h('div', { class: styles.value }, meta.id),
      ]),
      h('div', { class: styles.readonlyProperty }, [
        h('div', { class: styles.key }, 'Version'),
        h('div', { class: styles.value }, meta.version),
      ]),
    ]),
    h(TextInput, { label: 'Title', text: meta.title }),
  ]);
};
