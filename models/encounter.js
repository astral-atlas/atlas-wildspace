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

export const castVector3D/*: Cast<Vector3D>*/ = c.obj({ x: c.num, y: c.num, z: c.num });

/*::
export type MiniID = string;
export type MonsterMini = {
  type: 'monster',
  id: MiniID,
  position: Vector3D,
  visible: boolean,
  monsterId: MonsterID,

  conditions: $ReadOnlyArray<string>,
  hitpoints: number,
  tempHitpoints: number,
};
export type CharacterMini = {
  type: 'character',
  id: MiniID,
  position: Vector3D,
  characterId: CharacterID,

  conditions: $ReadOnlyArray<string>,
  hitpoints: number,
  tempHitpoints: number,
};
export type Mini =
  | MonsterMini
  | CharacterMini
export type Turn =
  | { type: 'monster', monsterId: MonsterID, initiativeResult: number, index: number, }
  | { type: 'character', characterId: CharacterID, initiativeResult: number, index: number, }

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

const castMonsterTurn = c.obj({
  type: c.lit('monster'),
  monsterId: castMonsterId,
  initiativeResult: c.num,
  index: c.num,
})
const castCharacterTurn = c.obj({
  type: c.lit('character'),
  characterId: castCharacterId,
  initiativeResult: c.num,
  index: c.num,
})

export const castTurn/*: Cast<Turn>*/ = c.or('type', {
  'monster': castMonsterTurn,
  'character': castCharacterTurn,
});

export const castMiniId/*: Cast<MiniID>*/ = c.str;
export const castMonsterMini/*: Cast<MonsterMini>*/ = c.obj({
  type: c.lit('monster'),
  id: castMiniId,
  position: castVector3D,
  visible: c.bool,
  monsterId: castMonsterId,

  conditions: c.arr(c.str),
  hitpoints: c.num,
  tempHitpoints: c.num,
});
export const castCharacterMini/*: Cast<CharacterMini>*/ = c.obj({
  type: c.lit('character'),
  id: castMiniId,
  position: castVector3D,
  characterId: castCharacterId,

  conditions: c.arr(c.str),
  hitpoints: c.num,
  tempHitpoints: c.num,
});
export const castMini/*: Cast<Mini>*/ = c.or('type', {
  character: castCharacterMini,
  monster: castMonsterMini,
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