// @flow strict
import { h, useState } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-three';
/*:: import type { PreviewPage, InitiativeTurnRowProps } from '@astral-atlas/wildspace-components'; */ 
/*:: import type { CharacterClass } from '@astral-atlas/wildspace-models'; */ 
import {
  ArmorCalculator,
  NumberInput,
  PreviewApp,
  ProficiencyInput,
  TabbedPreviewControlPane,
  TextInput,
  InitiativeRoundTable,
  InitiativeTurnRow
} from '@astral-atlas/wildspace-components';

import { circleInputPreview, selectInputPreview } from './inputs.js';
import { initativeStatusPreview, initiativePreview } from './initiative.js';
import { CameraPage } from './3d/camera.js';


const proficiencyPreview/*: PreviewPage<{ label: string, scale: number, value: number }>*/ = {
  name: '<ProficiencyInput />',
  defaultWorkplaceProps: {
    label: 'Proficiency Bonus',
    value: 4,
    scale: 1.5,
  },
  workspaceControls: ({ onWorkspacePropsChange, workspaceProps: { label, scale, value } }) => [
    h(TabbedPreviewControlPane, { tabs: [
      {
        name: 'Props',
        controls: [
          h(TextInput, { label: 'Label', value: label, onInput: label => onWorkspacePropsChange(v => ({ ...v, label })) }),
          h(NumberInput, { label: 'Scale', value: scale, min: 0, max: 6, step: 0.001, onInput: scale => onWorkspacePropsChange(v => ({ ...v, scale })) }),
        ]
      },
      {
        name: 'Values',
        controls: [
          h(NumberInput, { label: 'Value', value, min: 0, max: 6, step: 1, onInput: value => onWorkspacePropsChange(v => ({ ...v, value })) }),
        ],
      }
    ]} ),
 ],
  workspace: ({ label, scale, value }) => [
    h('div', {}, [
      h(ProficiencyInput, { style: { scale }, label, value, max: 6, min: 0 })
    ]),
  ],
};

const armorPreview/*: PreviewPage<{ }> */ = {
  name: '<ArmorCalculator />',
  defaultWorkplaceProps: {},
  workspaceControls: ({ onWorkspacePropsChange, workspaceProps: {} }) => [],
  workspace: ({  }) => [
    h('div', {}, [
      h(ArmorCalculator, { baseAC: 18, baseACReason: 'Plate Armor', bonuses: [] })
    ]),
  ],
};

const pages = [
  proficiencyPreview,
  armorPreview,
  initiativePreview,
  circleInputPreview,
  CameraPage,
  //initativeStatusPreview,
  //selectInputPreview
];

const WildspaceBook = () => {
  return [
    h(PreviewApp, { pages, title: 'Wildspace Component Book' }),
  ]
};

const main = () => {
  const { body } = document;
  if (!body)
    throw new Error();
  
  setTimeout(() => {
    try {
      render(h(WildspaceBook), body);
    } catch (error) {
      window.localStorage.removeItem("wildspace_book_index");
    }
  }, 50);
};

main();