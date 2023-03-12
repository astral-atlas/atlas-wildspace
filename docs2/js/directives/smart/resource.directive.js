// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { ResourceChipTagRow } from "../../../../components/dom/blocks/layout/ResourceChip";
import { FramePresenter } from "../presentation/FramePresenter";
import { FillBlock } from "../presentation/blocks";
import { ResourceChip, ResourceChipInlineRow, ResourceChipDivider, ResourceChipLabel, ResourceChipActionRow, ResourceChipset } from "@astral-atlas/wildspace-components";
import { h } from "@lukekaalim/act";
import { nanoid } from 'nanoid/non-secure';

export const ResourceChipDemo/*: Component<>*/ = () => {
  return h(FramePresenter, {  }, [
    h(ResourceChipset, { chips: [
      h(ResourceChip, { id: nanoid(), version: nanoid() }, [
        h(ResourceChipDivider),
        h(ResourceChipInlineRow, { fields: [
          { key: 'blorgs', value: Math.round(Math.random() * 100).toString() }
        ] }),
        h('div', { style: 'flex', flexDirection: 'row' }, [
          h(ResourceChipLabel, { label: 'inline input A' }, h('input', { type: 'text' })),
          h(ResourceChipLabel, { label: 'inline input B' }, h('input', { type: 'text' })),
        ]),
        h(ResourceChipActionRow, { actions: [
          { title: 'action!', onAction: () => alert('aaaa!') }
        ]})
      ]),

      h(ResourceChip, { id: nanoid(), version: nanoid() }, [
        h(ResourceChipDivider),
        h(ResourceChipTagRow, { currentTags: [
          { id: nanoid(), title: 'Tag A' },
          { id: nanoid(), title: 'Tag B' }
        ], allTags: [
          { id: nanoid(), title: 'Tag C' }
        ] }),
        h(ResourceChipInlineRow, { fields: [
          { key: 'blorgs', value: Math.round(Math.random() * 100).toString() }
        ] }),
        h('div', { style: 'flex', flexDirection: 'row' }, [
          h(ResourceChipLabel, { label: 'inline input A' }, h('input', { type: 'text' })),
          h(ResourceChipLabel, { label: 'inline input B' }, h('input', { type: 'text' })),
        ])
      ])
    ]}),
  ]);
};