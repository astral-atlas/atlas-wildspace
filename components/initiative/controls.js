// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
/*:: import type { CharacterMini, Character, Monster, Encounter, EncounterState, MiniID, EncounterAction, CharacterID } from '@astral-atlas/wildspace-models'; */
/*:: import type { PlainSelectInputProps } from '../inputs/select.js'; */
import { h, useState } from '@lukekaalim/act';
import { PlainLabel, PlainNumberInput, PlainSelectInput, PlainTextInput, SquareDivider } from '../entry.js';
import { v4 as uuid } from 'uuid';

import initiativeStyles from './initiative.module.css';
import { InitiativeTurnRow } from "./turn";
import { TurnControl } from "./controls/gameMaster.js";

/*::
export type EncounterInitiativeControlsProps = {
  className?: string,

  //characters: Character[],
  encounterState: EncounterState,

  selectedMinis: MiniID[],
  onSubmitActions: EncounterAction[] => mixed,
};
*/

const SelectionHints = () => [
  h('p', {}, `Click on a row in the Initative Tracker to select an actor.`),
  h('p', {}, `You can also select by clicking on the toggle circle on the left`),
  h('p', {}, `Hold <Shift> to select more than one actor at a time.`)
];

const DamageControl = ({ selectedMinis, onSubmitActions, state }) => {
  const [hitpoints, setHitpoints] = useState(0);
  return [
    h(PlainLabel, { label: 'Damage to Deal', style: { direction: 'above' } }, [
      h(PlainNumberInput, { value: hitpoints, onChange: setHitpoints }),
    ]),
    h('button', { disabled: hitpoints === 0, onClick: () => (
      setHitpoints(0),
      onSubmitActions(selectedMinis.map(miniId => ({ type: 'damage', miniId, hitpoints })))
    )}, 'Apply Damage')
  ];
};
const HealControl = ({ selectedMinis, onSubmitActions, state }) => {
  const [hitpoints, setHitpoints] = useState(0);
  return [
    h(PlainLabel, { label: 'Hitpoints to Heal', style: { direction: 'above' } }, [
      h(PlainNumberInput, { value: hitpoints, onChange: setHitpoints }),
    ]),
    h('button', { disabled: hitpoints === 0, onClick: () => (
      setHitpoints(0),
      onSubmitActions(selectedMinis.map(miniId => ({ type: 'heal', miniId, hitpoints })))
    ) }, 'Apply Healing')
  ];
};
const AddTagControl = ({ selectedMinis, onSubmitActions, state }) => {
  const [tagName, setTagName] = useState('');
  return [
    h(PlainLabel, { label: 'Tag to add', style: { direction: 'above' } }, [
      h(PlainTextInput, { value: tagName, onChange: setTagName }),
    ]),
    h('button', { disabled: tagName === '', onClick: () => (
      setTagName(''),
      onSubmitActions(selectedMinis.map(miniId => ({ type: 'add-tag', miniId, tagName })))
    ) }, 'Add Tag')
  ];
};
const RemoveTagControl = ({ selectedMinis, onSubmitActions, state }) => {
  const [tagName, setTagName] = useState(null);

  const tagsOnSelectedMinis = [...new Set(state.minis
    .filter(m => selectedMinis.includes(m.id))
    .map(m => m.conditions)
    .flat(1))];

  return [
    h(PlainLabel, { label: 'Tag to Remove', style: { direction: 'above' } }, [
      h(PlainSelectInput, { value: tagName, onChange: setTagName, options: [
        ...tagsOnSelectedMinis.map(tag => ({ label: tag, value: tag })),
        !tagName ? { label: '', value: '' } : null
       ].filter(Boolean) }),
    ]),
    h('button', { disabled: !tagName, onClick: () => {
      if (!tagName)
        return;
        setTagName('');
      onSubmitActions(selectedMinis.map(miniId => ({ type: 'remove-tag', tagName, miniId })));
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
  encounterState,
  onSubmitActions
}) => {
  const [actionType, setActionType] = useState/*:: <string>*/('damage')
  if (selectedMinis.length === 0)
    return h(SquareDivider, { className }, h(SelectionHints));

  const controlComponent = controlsByActionType[actionType] || null;

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
      controlComponent && h(controlsByActionType[actionType], { selectedMinis, onSubmitActions, state: encounterState })
    ]),
  ];
};

const AddAdhocMonsterControl = ({ onStateUpdate, state }) => {
  const [monsterMini, setMonsterMini] = useState({
    type: 'monster',
    id: uuid(),
    name: '',
    position: { x: 0, y: 0, z: 0},
    monsterId: 'temp',
  
    conditions: [],
    hitpoints: 50,
    maxHitpoints: 50,
    tempHitpoints: 0,
    visible: true,
  })
  const onClick = () => {
    onStateUpdate({ ...state, minis: [...state.minis, monsterMini] })
  };

  return [
    h(PlainLabel, { label: 'Name', style: { direction: 'above' } }, [
      h(PlainTextInput, {
        value: monsterMini.name,
        onChange: name => setMonsterMini({ ...monsterMini, name }) }),
    ]),
    h(PlainLabel, { label: 'Hitpoints', style: { direction: 'above' } }, [
      h(PlainNumberInput, {
        value: monsterMini.hitpoints,
        onChange: hitpoints => setMonsterMini({ ...monsterMini, hitpoints }) }),
    ]),
    h(PlainLabel, { label: 'Maximum Hitpoints', style: { direction: 'above' } }, [
      h(PlainNumberInput, {
        value: monsterMini.maxHitpoints,
        onChange: maxHitpoints => setMonsterMini({ ...monsterMini, maxHitpoints }) }),
    ]),
    h('button', { onClick }, 'Apply')
  ]
};

const AddMiniToInitiative = ({ onStateUpdate, state, characters }) => {
  const [turn, setTurn] = useState({
    miniId: '',
    initiativeResult: 0,
    index: 0,
  });

  const getMiniName = (mini) => {
    switch (mini.type) {
      case 'monster':
        return mini.name;
      case 'character':
        const character = characters.find(c => c.id === mini.characterId);
        if (!character)
          return '';
        return character.name;
    }
  }
  const onClick = () => {
    const turnOrder = [...state.turnOrder, turn]
      .sort((a, b) => b.initiativeResult - a.initiativeResult)
      .map((t, i) => ({ ...t, index: i }))
    onStateUpdate({ ...state, turnOrder })
  };
  console.log(turn, state.minis);

  return [
    h('div', { style: { display: 'flex' } }, [
      h(PlainLabel, { label: 'Mini ID', style: { direction: 'above' } }, [
        h/*:: <PlainSelectInputProps<MiniID>>*/(PlainSelectInput, {
          value: turn.miniId,
          options: [
            { label: '<No Mini>', value: '' },
            ...state.minis.map(m => ({ label: getMiniName(m), value: m.id }))],
          onChange: miniId => setTurn({ ...turn, miniId }) }),
      ]),
      h(PlainLabel, { label: 'Initiative Result', style: { direction: 'above' } }, [
        h(PlainNumberInput, {
          value: turn.initiativeResult,
          onChange: initiativeResult => setTurn({ ...turn, initiativeResult }) }),
      ]),
      h('button', { onClick, disabled: turn.miniId === '' }, 'Apply')
    ]),
  ]
};

const AddCharacterControl = ({ characters, onStateUpdate, state }) => {
  const [character, setCharacter] = useState({
    type: 'character',
    position: { x: 0, y: 0, z: 0},
    characterId: '',
  
    conditions: [],
    hitpoints: 0,
    tempHitpoints: 0,
  })

  const onClick = () => {
    onStateUpdate({ ...state, minis: [...state.minis, { ...character, id: uuid() }] });
  };

  return [
    h('div', { style: { display: 'flex' } }, [
      h(PlainLabel, { label: 'Character ID', style: { direction: 'above' } }, [
        h/*:: <PlainSelectInputProps<CharacterID>>*/(PlainSelectInput, {
          value: character.characterId,
          options: [
            { label: '<No Character>', value: '' },
            ...characters.map(c => ({ label: c.name, value: c.id }))],
          onChange: characterId => setCharacter({ ...character, characterId }) }),
      ]),
      h(PlainLabel, { label: 'Hitpoints', style: { direction: 'above' } }, [
        h(PlainNumberInput, {
          value: character.hitpoints,
          onChange: hitpoints => setCharacter({ ...character, hitpoints }) }),
      ]),
      h('button', { onClick, disabled: character.characterId === '' }, 'Apply')
    ]),
  ]
}
const RemoveMiniFromInitiative = ({ selectedMinis, onStateUpdate, state }) => {

  const onClick = () => {
    onStateUpdate({ ...state, turnOrder: state.turnOrder.filter(t => !selectedMinis.includes(t.miniId)) });
  };

  return [
    h('div', { style: { display: 'flex' } }, [
      h('button', { onClick }, 'Remove selected minis')
    ]),
  ]
}


/*::
export type GameMasterEncounterInitiativeControlsProps = {
  className?: string,

  selectedMinis: MiniID[],
  state: EncounterState,
  onStateUpdate: EncounterState => mixed,

  characters: Character[],
  monsters: Monster[],
  onSubmitActions: EncounterAction[] => mixed,
};
*/

const gmControls = {
  AddCharacterControl,
  AddAdhocMonsterControl,
  AddMiniToInitiative,
  RemoveMiniFromInitiative,
  TurnControl,
  ...controlsByActionType,
};

export const GameMasterEncounterInitiativeControls/*: Component<GameMasterEncounterInitiativeControlsProps>*/ = ({
  className,

  selectedMinis,
  state,
  onStateUpdate,

  characters,
  monsters,
  onSubmitActions,
}) => {
  const [controlIndex, setControlIndex] = useState(0);

  const controlComponent = gmControls[Object.keys(gmControls)[controlIndex]];

  return [
    h(SquareDivider, { className }, [
      h('p', {}, `${selectedMinis.length} target${selectedMinis.length > 1 ? 's' : ''} selected`),
      h(PlainLabel, { label: 'Action', style: { direction: 'above' } }, [
        h(PlainSelectInput, { value: controlIndex, options: Object.keys(gmControls).map((k, i) => ({ label: k, value: i })), onChange: setControlIndex }),
      ]),
      h('hr'),
      controlComponent && h(controlComponent, { characters, onStateUpdate, state, selectedMinis, onSubmitActions }),
    ]),
  ];
};
