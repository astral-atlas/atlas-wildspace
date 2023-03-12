// @flow strict
/*::
import type {
  ModelResourcePart, ModelResourcePartID,
  ModelResource
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
  modelResource: ModelResource,
  parts: ModelResourcePart[],
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

  onPartRemove = _ => {},
  onPartUpdate = (_, __) => {},
  onPartCreate = _ => {},
}) => {
  const partsForObject = parts
    .filter(p => p.modelResourceId === modelResource.id)
    .filter(p => p.objectUuid === object.uuid)

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
        h(ResourceChipTagRow, { tags: [] }),
        h(ResourceChipActionRow, { actions: [
          { title: 'Delete', onAction: onPartRemove && (() => onPartRemove(part.id)) }
        ]}),
      ])) })
  ]);
};