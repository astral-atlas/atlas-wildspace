// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Monster, MonsterID, CharacterID, Character } from "./character.js"; */
/*:: import type { GameID } from './game.js'; */
/*:: import type { Vector3D } from './encounter/map.js'; */
/*:: import type { Mini, MiniID, MonsterMini, CharacterMini } from './encounter/mini.js'; */
/*:: import type { EncounterAction } from './encounter/actions.js'; */
import { c } from '@lukekaalim/cast';
import { castMonsterId, castMonster, castCharacterId } from './character.js';
import { castMini, castMonsterMini, castCharacterMini, castMiniId } from './encounter/mini.js';
import { castGameId } from './game.js';

/*::
export type EncounterID = string;
*/


export const getRoundedMonsterHealthPercentage = (monster/*: MonsterMini*/)/*: number*/ => {
  const healthPercentage = (monster.hitpoints + monster.tempHitpoints) / monster.maxHitpoints * 100;
  switch (true) {
    case healthPercentage <= 0:
      return 0;
    case monster.hitpoints < 10:
      return 5;
    case healthPercentage > 99:
      return 100;
    case healthPercentage > 50:
      return 75;
    case healthPercentage > 0:
      return 25;
  }
  return -1;
}
export const getMonsterHealthDescription = (monster/*: MonsterMini*/)/*: string*/ => {
  const healthPercentage = (monster.hitpoints + monster.tempHitpoints) / monster.maxHitpoints * 100;

  switch (true) {
    case healthPercentage <= 0:
      return `🪦 Dead`;
    case monster.hitpoints < 10:
      return `🌶️ uh oh`;
    case healthPercentage > 99:
      return `💚 Untouched`;
    case healthPercentage > 50:
      return `💙 Healthy`;
    case healthPercentage > 10:
      return `🧡 Bloody`;
  }
  return 'Unknown';
};

/*::
export type Turn = { miniId: MiniID, initiativeResult: number, index: number, }

export type Encounter = {
  id: EncounterID,
  gameId: GameID,
  name: string,
  visibility:
    | 'players' | 'game-master',

  characters: $ReadOnlyArray<CharacterID>,
};

export type EncounterState = {
  encounterId: EncounterID,
  minis: $ReadOnlyArray<Mini>,

  round: number,
  turnIndex: number,
  turnOrder: $ReadOnlyArray<Turn>,
};
*/

export const castTurn/*: Cast<Turn>*/ = c.obj({
  miniId: castMiniId,
  initiativeResult: c.num,
  index: c.num,
});

export const castEncounterId/*: Cast<EncounterID>*/ = c.str;
export const castEncounter/*: Cast<Encounter>*/ = c.obj({
  id: castEncounterId,
  gameId: castGameId,
  name: c.str,
  visibility: c.enums(['players', 'game-master']),

  characters: c.arr(castCharacterId),
});

export const castEncounterState/*: Cast<EncounterState>*/ = c.obj({
  encounterId: castEncounterId,
  minis: c.arr(castMini),

  round: c.num,
  turnIndex: c.num,
  turnOrder: c.arr(castTurn),
});

export * from './encounter/actions.js';
export * from './encounter/map.js';
export * from './encounter/reducer.js';
export * from './encounter/mini.js';