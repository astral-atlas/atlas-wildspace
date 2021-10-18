// @flow strict
import { h, useState } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-web';
/*:: import type { PreviewPage, PlainSelectInputProps } from '@astral-atlas/wildspace-components'; */ 
/*:: import type { CharacterClass } from '@astral-atlas/wildspace-models'; */ 
import {
  ArmorCalculator,
  NumberInput,
  PreviewApp,
  ProficiencyInput,
  TabbedPreviewControlPane,
  PlainSelectInput,
  TextInput,
  CircleCheckboxInput,
  SelectInput,
} from '@astral-atlas/wildspace-components';


export const circleInputPreview/*: PreviewPage<{ checked: boolean, disabled: boolean, scale: number }>*/ = {
  name: h('pre', {}, '<CircleCheckboxInput />'),
  defaultWorkplaceProps: {
    checked: true,
    disabled: false,
    scale: 1.5,
  },
  workspaceControls: ({ onWorkspacePropsChange, workspaceProps: { checked, disabled, scale } }) => [
    h(TabbedPreviewControlPane, { tabs: [
      {
        name: 'Props',
        controls: [
          h(SelectInput, { value: checked ? 'true' : 'false', values: ['true', 'false'], label: 'Value', onChange: checked => onWorkspacePropsChange(v => ({ ...v, checked: checked === 'true' })) }),
          h(SelectInput, { value: disabled ? 'true' : 'false', values: ['true', 'false'], label: 'Disabled', onChange: disabled => onWorkspacePropsChange(v => ({ ...v, disabled: disabled === 'true' })) }),
        ]
      },
      {
        name: 'Style',
        controls: [
          h(NumberInput, { label: 'Scale', value: scale, min: 0, max: 6, step: 0.001, onInput: scale => onWorkspacePropsChange(v => ({ ...v, scale })) }),
        ]
      },
    ]} ),
 ],
  workspace: ({ checked, disabled, scale }) => [
    h('div', {}, [
      h(CircleCheckboxInput, { value: checked, disabled, style: { scale } })
    ]),
  ],
};

export const selectInputPreview/*: PreviewPage<{ options: { label: string, value: number }[] }>*/ = {
  name: h('pre', {}, '<PlainSelectInput />'),
  defaultWorkplaceProps: {
    options: [{ label: 'Option One', value: 0 }, { label: 'Option Two', value: 10 }]
  },
  workspaceControls: ({ onWorkspacePropsChange, workspaceProps: { options } }) => [
    //h(TabbedPreviewControlPane),
 ],
  workspace: ({ options }) => [
    h('div', {}, [
      h/*:: <PlainSelectInputProps<number>>*/(PlainSelectInput, { options })
    ]),
  ],
};