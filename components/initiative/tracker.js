// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
/*:: import type { CharacterMini, Character, Monster, Encounter, EncounterState, MiniID } from '@astral-atlas/wildspace-models'; */
import { h } from '@lukekaalim/act';
import { SquareDivider } from '../entry.js';

import initiativeStyles from './initiative.module.css';
import { InitiativeTurnRow } from "./turn";
import { InitiativeRoundTable } from "./round";

/*::
export type EncounterInitiativeTrackerProps = {|
  className?: string,

  characters: Character[],
  encounter: Encounter,
  encounterState: EncounterState,

  selectedMinis: MiniID[],
  onSelectedMinisChange: MiniID[] => mixed,
|};
*/

const getMiniForTurn = (state, turn) => {
  switch (turn.type) {
    case 'monster':
      return state.minis
        .map(m => m.type === 'monster' ? m : null)
        .filter(Boolean)
        .find(m => m.monsterId === turn.monsterId);
    case 'character':
      return state.minis
        .map(m => m.type === 'character' ? m : null)
        .filter(Boolean)
        .find(m => m.characterId === turn.characterId);
  }
}

const MonsterRow = ({ encounter, mini }) => {
  return  null;
  /*
  return h(InitiativeTurnRow, {

  });
  */
};
const CharacterRow = ({ turn, encounter, mini, character, encounterState }) => {
  return h(InitiativeTurnRow, {
    name: character.name,
    hitpoints: mini.hitpoints,
    tempHitpoints: mini.tempHitpoints,
    maxHitpoints: character.maxHitpoints,
    selected: false,
    active: encounterState.turnIndex === turn.index,
    turn: turn.initiativeResult,
    iconURL: '',
    tags: [...mini.conditions],
  });
};

export const EncounterInitiativeTracker/*: Component<EncounterInitiativeTrackerProps>*/ = ({
  encounter,
  encounterState,
  characters,
  className,
}) => {
  return [
    h(InitiativeRoundTable, { roundName: encounter.name, className }, [
      [...encounterState.turnOrder].sort((a, b) => a.index - b.index).map(turn => {
        const mini = getMiniForTurn(encounterState, turn);
        if (!mini)
          return null;
        switch (mini.type) {
          default:
              return null;
          case 'monster':
            return h(MonsterRow, { turn, mini, encounter });
          case 'character':
            const character = characters.find(c => c.id === mini.characterId);
            if (!character)
              return null;
            return h(CharacterRow, { turn, mini, encounter, character, encounterState });
        }
      })
    ])
  ]
};