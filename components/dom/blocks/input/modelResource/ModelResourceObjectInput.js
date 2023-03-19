// @flow strict
/*::
import type {
  ModelResourcePart, ModelResourcePartID,
  ModelResource,
  Tag, TagID,
} from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
import type { Object3D } from "three";
*/
import { h } from "@lukekaalim/act";
import { ResourceChip, ResourceChipLabel, ResourceChipset, ResourceLayout } from "../../layout";
import { ResourceMetaInput } from "../ResourceMetaInput";
import styles from './ModelResourceObjectInput.module.css';
import {
  ResourceChipActionRow,
  ResourceChipDivider,
  ResourceChipInlineRow,
  ResourceChipTagRow,
} from "../../layout/ResourceChip";

/*::
export type ModelResourceObjectInputProps = {
  allTags?: $ReadOnlyArray<Tag>,

  modelResource: ModelResource,
  parts: ModelResourcePart[],

  onEvent?: (
    | { type: 'submit-new-tag', tagTitle: string, partId: ModelResourcePartID }
    | { type: 'update-part', partId: ModelResourcePartID, part: ModelResourcePart }
  ) => mixed,

  onPartCreate?: () => mixed,
  onPartRemove?: (id: ModelResourcePartID) => mixed,
  onPartUpdate?: (id: ModelResourcePartID, part: ModelResourcePart) => mixed,
  object: Object3D,
};
*/

export const ModelResourceObjectInput/*: Component<ModelResourceObjectInputProps>*/ = ({
  modelResource,
  parts,
  object,
  allTags = [],
  onEvent = _ => {},

  onPartRemove = _ => {},
  onPartUpdate = (_, __) => {},
  onPartCreate = _ => {},
}) => {
  const partsForObject = parts
    .filter(p => p.modelResourceId === modelResource.id)
    .filter(p => p.objectUuid === object.uuid)

  console.log(parts
    .filter(p => p.modelResourceId === modelResource.id))
  console.log(parts
    .filter(p => p.objectUuid === object.uuid))

  const onTagEvent = (part) => (event) => {
    switch (event.type) {
      case 'attach-tag':
        return onPartUpdate(part.id, { ...part, tags: [...part.tags, event.tagId] })
      case 'detach-tag':
        return onPartUpdate(part.id, { ...part, tags: part.tags.filter(id => id !== event.tagId) })
      case 'submit-new-tag':
        return onEvent({ type: 'submit-new-tag', partId: part.id, tagTitle: event.tagTitle })
    }
  }

  return h('div', { style: { display: 'flex', flexDirection: 'column', overflow: 'hidden' } }, [
    h('button', { onClick: onPartCreate }, 'Add Part'),
    h(ResourceChipset, { chips: partsForObject.map(part =>
      h(ResourceChip, { id: part.id, version: part.version }, [
        h(ResourceChipDivider),
        /*h(ResourceChipInlineRow, { fields: [
          { key: 'modelResourceId', value: part.modelResourceId },
          { key: 'objectUuid', value: part.objectUuid },
        ] }),*/
        h(ResourceChipLabel, { label: 'title' },
          h('input', { type: 'text', value: part.title, onInput: e => onPartUpdate(part.id, {
            ...part,
            title: e.target.value,
          }) })),
        allTags && h(ResourceChipTagRow, {
          allTags,
          attachedTagIds: part.tags,
          onEvent: onTagEvent(part)
        }),
        h(ResourceChipActionRow, { actions: [
          { title: 'Delete', onAction: onPartRemove && (() => onPartRemove(part.id)) }
        ]}),
      ])) })
  ]);
};