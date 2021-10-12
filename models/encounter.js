// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Monster, MonsterID, CharacterID } from "./character.js"; */
/*:: import type { GameID } from './game.js'; */
import { c } from '@lukekaalim/cast';
import { castMonsterId, castMonster, castCharacterId } from './character.js';
import { castGameId } from './game.js';

/*::
export type EncounterID = string;
export type Vector3D = { x: number, y: number, z: number };
*/

/*::

export type MonsterMini = {
  type: 'monster',
  position: Vector3D,
  visible: boolean,
  monsterId: MonsterID,

  conditions: $ReadOnlyArray<string>,
  description: string,
};
export type CharacterMini = {
  type: 'character',
  position: Vector3D,
  characterId: CharacterID,
  conditions: $ReadOnlyArray<string>,
  hitpoints: number,
};
export type Mini =
  | MonsterMini
  | CharacterMini
export type Turn =
  | { type: 'monster', monsterId: MonsterID }
  | { type: 'character', characterId: CharacterID }
export type Encounter = {
  id: EncounterID,
  gameId: GameID,
  name: string,

  characters: $ReadOnlyArray<CharacterID>,
  minis: $ReadOnlyArray<Mini>,

  round: number,
  turnIndex: number,
  turnOrder: $ReadOnlyArray<Turn>,
};
*/

const castMonsterTurn = c.obj({
  type: c.lit('monster'),
  monsterId: castMonsterId
})
const castCharacterTurn = c.obj({
  type: c.lit('character'),
  characterId: castCharacterId,
})

export const castTurn/*: Cast<Turn>*/ = c.or('type', {
  'monster': castMonsterTurn,
  'character': castCharacterTurn,
});

export const castEncounterId/*: Cast<EncounterID>*/ = c.str;
export const castEncounter/*: Cast<Encounter>*/ = c.obj({
  id: castEncounterId,
  gameId: castGameId,
  name: c.str,

  characters: c.arr(castCharacterId),
  minis: c.arr(v => { throw new Error() }),

  round: c.num,
  turnIndex: c.num,
  turnOrder: c.arr(castTurn),
});

/*::
export type EncounterState = {
  cursors: $ReadOnlyArray<{ userId: UserID, position: Vector3D }>
};
*/
