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
  InitiativeTurnRow,
  ReadmePageContent
} from '@astral-atlas/wildspace-components';

import { circleInputPreview, selectInputPreview } from './inputs.js';
import { initativeStatusPreview, initiativePreview } from './initiative.js';
import { CameraPage } from './components/3d/camera.js';

import readmeMd from './readme.md?raw'
import hooksMd from './hooks.md?raw'
import componentsMd from './components.md?raw'
import { mouseDragPage } from './hooks/mouseDrag.js';
import { threeComponents } from "./components/3d";
import { keyboardPage } from './hooks/keyboard.js';


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

const components = {
  name: 'components',
  href: '/',
  content: [h(ReadmePageContent, { text: componentsMd })],
  children: [
    threeComponents
  ],
};
const hooks = {
  name: 'hooks',
  href: '/',
  content: [h(ReadmePageContent, { text: hooksMd })],
  children: [
    mouseDragPage,
    keyboardPage,
  ],
};

const readme = {
  name: 'readme',
  href: '/',
  content: [h(ReadmePageContent, { text: readmeMd })],
  children: [components, hooks],
};

const WildspaceBook = () => {
  return [
    h(PreviewApp, { root: readme, title: null }),
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