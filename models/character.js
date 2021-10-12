// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { GameID } from './game.js'; */
import { createObjectCaster, createArrayCaster, castString, castNumber } from '@lukekaalim/cast';
import { castUserId } from "@astral-atlas/sesame-models";
import { castGameId } from './game.js';

/*::
export type CharacterID = string;
export type Character = {
  id: CharacterID,
  playerId: UserID,
  gameId: GameID,

  name: string,
  shortDescription: string,
  iconURL: string,

  hitPoints: number,
  armorClass: number,
  conditions: $ReadOnlyArray<string>,
};

export type MonsterID = string;
export type Monster = {
  id: MonsterID,
  gameId: GameID,

  name: string,
  shortDescription: string,
  iconURL: string,

  healthDescription: string,
  conditions:  $ReadOnlyArray<string>,
};
*/

export const castCharacterId/*: Cast<CharacterID>*/ = castString;
export const castCharacter/*: Cast<Character>*/ = createObjectCaster({
  id: castCharacterId,
  playerId: castUserId,
  gameId: castGameId,

  name: castString,
  shortDescription: castString,
  iconURL: castString,

  hitPoints: castNumber,
  armorClass: castNumber,
  conditions:createArrayCaster(castString),
})

export const castMonsterId/*: Cast<MonsterID>*/ = castString;
export const castMonster/*: Cast<Monster>*/ = createObjectCaster({
  id: castCharacterId,
  gameId: castGameId,

  name: castString,
  shortDescription: castString,
  iconURL: castString,

  healthDescription: castString,
  conditions:createArrayCaster(castString),
});
