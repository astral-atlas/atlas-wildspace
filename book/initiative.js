// @flow strict
import { h, useState } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-web';
/*:: import type { PreviewPage, EncounterInitiativeTrackerProps,ListInputProps, EncounterInitiativeControlsProps } from '@astral-atlas/wildspace-components'; */ 
/*:: import type { CharacterClass, Encounter, Turn, Character, CharacterMini } from '@astral-atlas/wildspace-models'; */ 
import {
  ArmorCalculator,
  NumberInput,
  PreviewApp,
  ProficiencyInput,
  TabbedPreviewControlPane,
  TextInput,
  CircleCheckboxInput,
  SelectInput,
  InitiativeRoundTable,
  InitiativeTurnRow,
  EncounterInitiativeTracker,
  ListInput,
  EncounterInitiativeControls
} from '@astral-atlas/wildspace-components';


const CharacterControls = ({ }) => {
  return [

  ]
};

export const initiativePreview/*: PreviewPage<EncounterInitiativeTrackerProps> */ = {
  name: h('pre', {}, '<EncounterInitiativeTracker />'),
  defaultWorkplaceProps: {
    encounter: {
      id: '0',
      gameId: '0',
      name: '',
    
      characters: [],
      minis: [],
    
      round: 0,
      turnIndex: 0,
      turnOrder: [],
    },
    characters: [],
    encounterState: {

    },
    selectedMinis: [],
    onSelectedMinisChange: () => {},
  },
  workspaceControls: ({ onWorkspacePropsChange: set, workspaceProps: props }) => [
    h(TabbedPreviewControlPane, { tabs: [
      {
        name: 'Turns',
        controls: [
          h/*:: <ListInputProps<Turn>>*/(ListInput, {
            value: [...props.encounter.turnOrder],
            onChange: turnOrder => set({ ...props, encounter: { ...props.encounter, turnOrder }}),
            initialValue: { index: 0, type: 'character', characterId: '0', initiativeResult: 10 },
            controlComponent: ({ value, onValueChange }) => {
              if (value.type === 'monster')
                return [
                  h(SelectInput, {
                    label: 'type',
                    value: value.type,
                    values: ['monster', 'character'],
                    onChange: type => onValueChange(type === 'monster' ? { ...value, type } : ({
                      ...value,
                      type: 'character',
                      characterId: '0',
                    }))
                  }),
                  h(TextInput, { label: 'MonsterID', value: value.monsterId, onChange: monsterId => onValueChange({ ...value, monsterId }) }),
                  h(NumberInput, { label: 'index', value: value.index, onChange: index => onValueChange({ ...value, index }) }),
                  h(NumberInput, { label: 'initiativeResult', value: value.initiativeResult, onChange: initiativeResult => onValueChange({ ...value, initiativeResult }) }),
                ]
              else
                return [
                  h(SelectInput, {
                    label: 'type',
                    value: value.type,
                    values: ['monster', 'character'],
                    onChange: type => onValueChange(type === 'character' ? { ...value, type } : ({
                      ...value,
                      type: 'monster',
                      monsterId: '0',
                    }))
                  }),
                  h(TextInput, { label: 'CharacterID', value: value.characterId, onChange: characterId => onValueChange({ ...value, characterId }) }),
                  h(NumberInput, { label: 'index', value: value.index, onChange: index => onValueChange({ ...value, index }) }),
                  h(NumberInput, { label: 'initiativeResult', value: value.initiativeResult, onChange: initiativeResult => onValueChange({ ...value, initiativeResult }) }),
                ]
            },
            previewComponent: ({ value: turn }) => {
              return [
                h('pre', {}, JSON.stringify(turn, null, 2)),
              ]
            }
          })
        ]
      },
      {
        name: 'Characters',
        controls: [
          h/*:: <ListInputProps<Character>>*/(ListInput, {
            value: [...props.characters],
            onChange: characters => set({ ...props, characters }),
            initialValue: { id: '0', maxHitpoints: 100, name: '' },
            controlComponent: ({ value, onValueChange }) => [
              h(TextInput, { label: 'name', value: value.name, onChange: name => onValueChange({ ...value, name }) }),
              h(TextInput, { label: 'id', value: value.id, onChange: id => onValueChange({ ...value, id }) }),
              h(NumberInput, { label: 'maxHitpoints', value: value.maxHitpoints, onChange: maxHitpoints => onValueChange({ ...value, maxHitpoints }) }),
            ],
            previewComponent: ({ value: turn }) => {
              return [
                h('pre', {}, JSON.stringify(turn, null, 2)),
              ]
            }
          })
        ]
      },
      {
        name: 'Minis',
        controls: [
          h/*:: <ListInputProps<CharacterMini>>*/(ListInput, {
            value: [...props.encounter.minis.map(m => m.type === 'character' ? m : null).filter(Boolean)],
            onChange: minis => set({ ...props, encounter: { ...props.encounter, minis } }),
            initialValue: { conditions: [], characterId: '0', hitpoints: 0, id: '0', position: { x: 0, y: 0, z: 0 }, tempHitpoints: 0, type: 'character' },
            controlComponent: ({ value, onValueChange }) => [
              h(TextInput, { label: 'id', value: value.characterId, onChange: characterId => onValueChange({ ...value, characterId }) }),
              h(NumberInput, { label: 'hitpoints', value: value.hitpoints, onChange: hitpoints => onValueChange({ ...value, hitpoints }) }),
            ],
            previewComponent: ({ value: mini }) => {
              return [
                h('pre', {}, JSON.stringify(mini, null, 2)),
              ]
            }
          })
        ]
      },
      {
        name: 'Encounter',
        controls: [
          h(NumberInput, {
            label: 'turnIndex',
            value: props.encounter.turnIndex,
            onChange: turnIndex => set({ ...props, encounter: { ...props.encounter, turnIndex } }) }),
          h(TextInput, {
            label: 'name',
            value: props.encounter.name,
            onChange: name => set({ ...props, encounter: { ...props.encounter, name } }) }),
        ]
      },
    ]})
  ],
  workspace: EncounterInitiativeTracker,
};

export const initativeStatusPreview/*: PreviewPage<EncounterInitiativeControlsProps> */ = {
  name: h('pre', {}, '<EncounterInitiativeControls />'),
  defaultWorkplaceProps: {
    selectedMinis: ['0', '2'],
    encounter: { minis: [{ id: '0', conditions: ['hot', 'cold'] }, { id: '2', conditions: ['red', 'blue']}, { id: '3', conditions: ['alpha', 'omega']}] }
  },
  workspaceControls: ({ workspaceProps: props, onWorkspacePropsChange: update }) => [
    h/*:: <ListInputProps<string>>*/(ListInput, {
      value: props.selectedMinis,
      initialValue: '',
      onChange: selectedMinis => update({ ...props, selectedMinis }),
      controlComponent: ({ value, onValueChange }) => h(TextInput, { label: 'MiniID', value, onChange: onValueChange }),
      previewComponent: ({ value }) => h('pre', {}, value),
    })
  ],
  workspace: EncounterInitiativeControls,
};