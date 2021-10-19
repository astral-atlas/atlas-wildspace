// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Monster, MonsterID, CharacterID, Character } from "../character.js"; */
/*:: import type { GameID } from '../game.js'; */
/*:: import type { Vector3D } from '../encounter/map.js'; */
/*:: import type { Mini, MiniID, MonsterMini, CharacterMini } from '../encounter/mini.js'; */
/*:: import type { EncounterAction } from '../encounter/actions.js'; */
/*:: import type { EncounterState } from '../encounter.js'; */

const reduceMonsterMiniState = (mini, action) => {
  switch (action.type) {
    case 'add-tag':
      return { ...mini, conditions: [...new Set([...mini.conditions, action.tagName])] };
    case 'remove-tag':
      return { ...mini, conditions: mini.conditions.filter(c => c !== action.tagName) };
    case 'damage': {
      const tempHitpoints = Math.max(0, mini.tempHitpoints - action.hitpoints);
      const hitpoints = Math.max(0, mini.hitpoints + Math.min(0, mini.tempHitpoints - action.hitpoints))
      return { ...mini, hitpoints, tempHitpoints }
    }
    case 'heal': {
      const hitpoints = Math.min(mini.maxHitpoints, mini.hitpoints + action.hitpoints)
      return { ...mini, hitpoints }
    }
    case 'grant-temp': {
      const tempHitpoints = action.tempHitpoints;
      return { ...mini, tempHitpoints }
    }
  }
  return mini;
}
const reduceCharacterMiniState = (mini, characters, action) => {
  const character = characters.find(c => c.id === mini.characterId);
  if (!character)
    return mini;
  switch (action.type) {
    case 'add-tag':
      return { ...mini, conditions: [...new Set([...mini.conditions, action.tagName])] };
    case 'remove-tag':
      return { ...mini, conditions: mini.conditions.filter(c => c !== action.tagName)  };
    case 'damage': {
      const tempHitpoints = Math.max(0, mini.tempHitpoints - action.hitpoints);
      const hitpoints = Math.max(0, mini.hitpoints + Math.min(0, mini.tempHitpoints - action.hitpoints))
      return { ...mini, hitpoints, tempHitpoints }
    }
    case 'heal': {
      const hitpoints = Math.min(character.maxHitpoints, mini.hitpoints + action.hitpoints)
      return { ...mini, hitpoints }
    }
    case 'grant-temp': {
      const tempHitpoints = action.tempHitpoints;
      return { ...mini, tempHitpoints }
    }
  }
  return mini;
}
const reduceMiniState = (mini, characters, action) => {
  switch (mini.type) {
    case 'character':
      return reduceCharacterMiniState(mini, characters, action);
    case 'monster':
      return reduceMonsterMiniState(mini, action);
  }
  return mini;
}

export const reduceEncounterState = (state/*: EncounterState*/, characters/*: $ReadOnlyArray<Character>*/, action/*: EncounterAction*/)/*: EncounterState*/ => {
  switch (action.type) {
    case 'add-tag':
    case 'remove-tag':
    case 'damage':
    case 'heal':
    case 'grant-temp':
      return { ...state, minis: state.minis.map(mini => mini.id === action.miniId ? reduceMiniState(mini, characters, action) : mini) };
  }
  return state;
};