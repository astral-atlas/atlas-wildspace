// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
/*:: import type { CharacterMini, Character, Monster, Encounter, EncounterState, MiniID } from '@astral-atlas/wildspace-models'; */
import { h, useState } from '@lukekaalim/act';
import { PlainLabel, PlainNumberInput, PlainSelectInput, PlainTextInput, SquareDivider } from '../entry.js';

import initiativeStyles from './initiative.module.css';
import { InitiativeTurnRow } from "./turn";

/*::
export type EncounterInitiativeControlsProps = {
  className?: string,

  //characters: Character[],
  encounterState: EncounterState,

  selectedMinis: MiniID[],
};
*/

const SelectionHints = () => [
  h('p', {}, `Click on a row in the Initative Tracker to select an actor.`),
  h('p', {}, `You can also select by clicking on the toggle circle on the left`),
  h('p', {}, `Hold <Shift> to select more than one actor at a time.`)
];

const DamageControl = ({ selectedMinis, onApplyAction }) => {
  const [hitpoints, setHitpoints] = useState(0);
  return [
    h(PlainLabel, { label: 'Damage to Deal', style: { direction: 'above' } }, [
      h(PlainNumberInput, { value: hitpoints, onChange: setHitpoints }),
    ]),
    h('button', { disabled: hitpoints === 0, onClick: () => (
      setHitpoints(0),
      onApplyAction(selectedMinis.map(miniId => ({ type: 'damage', hitpoints, miniId })))
     ) }, 'Apply Damage')
  ];
};
const HealControl = ({ selectedMinis, onApplyAction }) => {
  const [hitpoints, setHitpoints] = useState(0);
  return [
    h(PlainLabel, { label: 'Hitpoints to Heal', style: { direction: 'above' } }, [
      h(PlainNumberInput, { value: hitpoints, onChange: setHitpoints }),
    ]),
    h('button', { disabled: hitpoints === 0, onClick: () => (
      setHitpoints(0),
      onApplyAction(selectedMinis.map(miniId => ({ type: 'damage', hitpoints: -hitpoints, miniId })))
    ) }, 'Apply Healing')
  ];
};
const AddTagControl = ({ selectedMinis, onApplyAction }) => {
  const [tag, setTag] = useState('');
  return [
    h(PlainLabel, { label: 'Tag to add', style: { direction: 'above' } }, [
      h(PlainTextInput, { value: tag, onChange: setTag }),
    ]),
    h('button', { disabled: tag === '', onClick: () => (
      setTag(''),
      onApplyAction(selectedMinis.map(miniId => ({ type: 'tag', tag, miniId })))
    ) }, 'Add Tag')
  ];
};
const RemoveTagControl = ({ selectedMinis, encounter, onApplyAction }) => {
  const [tag, setTag] = useState(null);

  const tagsOnSelectedMinis = encounter.minis
    .filter(m => selectedMinis.includes(m.id))
    .map(m => m.conditions)
    .flat(1);

  return [
    h(PlainLabel, { label: 'Tag to Remove', style: { direction: 'above' } }, [
      h(PlainSelectInput, { value: tag, onChange: setTag, options: [
        ...tagsOnSelectedMinis.map(tag => ({ label: tag, value: tag })),
        !tag ? { label: '', value: '' } : null
       ].filter(Boolean) }),
    ]),
    h('button', { disabled: !tag, onClick: () => {
      if (!tag)
        return;
      setTag('');
      onApplyAction(selectedMinis.map(miniId => ({ type: 'tag', tag, miniId })));
     } }, 'Remove Tag')
  ];
};

const controlsByActionType = {
  'damage': DamageControl,
  'healing': HealControl,
  'add-tag': AddTagControl,
  'remove-tag': RemoveTagControl
};

export const EncounterInitiativeControls/*: Component<EncounterInitiativeControlsProps>*/ = ({
  selectedMinis,
  className,
  onApplyAction = _ => {},
  encounter
}) => {
  const [actionType, setActionType] = useState/*:: <'damage' | 'healing' | 'add-tag' | 'remove-tag'>*/('damage')
  if (selectedMinis.length === 0)
    return h(SquareDivider, { className }, h(SelectionHints));

  return [
    h(SquareDivider, { className }, [
      h('p', {}, `${selectedMinis.length} target${selectedMinis.length > 1 ? 's' : ''} selected`),
      h(PlainLabel, { label: 'Action to perform on Selected', style: { direction: 'above' } }, [
        h(PlainSelectInput, { value: actionType, options: [
          { label: 'Damage', value: 'damage' },
          { label: 'Healing', value: 'healing' },
          { label: 'Add Tag', value: 'add-tag'},
          { label: 'Remove Tag', value: 'remove-tag'}
        ], onChange: setActionType }),
      ]),
      h('hr'),
      h(controlsByActionType[actionType], { selectedMinis, onApplyAction, encounter })
    ]),
  ];
};
