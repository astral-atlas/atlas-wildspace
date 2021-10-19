// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
/*:: import type { CharacterMini, Character, Monster, Encounter, EncounterState, MiniID } from '@astral-atlas/wildspace-models'; */
import { h } from '@lukekaalim/act';
import { getMonsterHealthDescription } from '@astral-atlas/wildspace-models';
import { SquareDivider } from '../entry.js';

import initiativeStyles from './initiative.module.css';
import { InitiativeTurnRow } from "./turn";
import { InitiativeRoundTable } from "./round";

/*::
export type EncounterInitiativeTrackerProps = {|
  className?: string,
  gameMaster: boolean,

  characters: Character[],
  encounter: Encounter,
  encounterState: EncounterState,

  selectedMinis: MiniID[],
  onSelectedMinisChange: MiniID[] => mixed,
|};
*/

const MonsterRow = ({ encounter, encounterState, turn, mini, selectedMinis, onClick, gameMaster }) => {
  return h(InitiativeTurnRow, {
    name: mini.name,
    
    health: gameMaster ?
      { type: 'values', hitpoints: mini.hitpoints, tempHitpoints: mini.tempHitpoints, maxHitpoints: mini.maxHitpoints } :
      { type: 'description', element: getMonsterHealthDescription(mini) },
    selected: selectedMinis.includes(mini.id),
    active: encounterState.turnIndex === turn.index,
    turn: turn.initiativeResult,
    iconURL: '',
    onClick,
    tags: [...mini.conditions],
  });
};
const CharacterRow = ({ turn, encounter, mini, character, encounterState, onClick, selectedMinis }) => {
  return h(InitiativeTurnRow, {
    name: character.name,
    health: { type: 'values', hitpoints: mini.hitpoints, tempHitpoints: mini.tempHitpoints, maxHitpoints: character.maxHitpoints },
    selected: selectedMinis.includes(mini.id),
    active: encounterState.turnIndex === turn.index,
    turn: turn.initiativeResult,
    iconURL: '',
    tags: [...mini.conditions],
    onClick
  });
};

export const EncounterInitiativeTracker/*: Component<EncounterInitiativeTrackerProps>*/ = ({
  encounter,
  encounterState,
  characters,
  className,
  selectedMinis,
  onSelectedMinisChange,
  gameMaster,
}) => {
  const onRowClick = (e, mini) => {
    const miniSelected = selectedMinis.includes(mini.id);
    e.preventDefault();
    if (e.shiftKey)
      return onSelectedMinisChange([...selectedMinis.filter(m => m !== mini.id), miniSelected ? null : mini.id].filter(Boolean));
    return onSelectedMinisChange([mini.id]);
  };

  return [
    h(InitiativeRoundTable, { roundName: encounter.name, className }, [
      [...encounterState.turnOrder].sort((a, b) => a.index - b.index).map(turn => {
        const mini = encounterState.minis.find(m => m.id === turn.miniId)
        if (!mini)
          return null;
        switch (mini.type) {
          default:
              return null;
          case 'monster':
            return h(MonsterRow, { gameMaster, turn, mini, encounter, encounterState, onClick: (e) => onRowClick(e, mini), selectedMinis });
          case 'character':
            const character = characters.find(c => c.id === mini.characterId);
            if (!character)
              return null;
            return h(CharacterRow, { turn, mini, encounter, character, encounterState, onClick: (e) => onRowClick(e, mini), selectedMinis });
        }
      })
    ])
  ]
};