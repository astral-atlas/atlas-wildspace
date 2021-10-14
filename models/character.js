// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */

/*:: import type { GameID } from './game.js'; */
/*:: import type { AssetID } from "./asset"; */
import { createObjectCaster, createArrayCaster, castString, c, castObject, castBoolean } from '@lukekaalim/cast';
import * as sm from "@astral-atlas/sesame-models";
import { castGameId } from './game.js';
import { castAssetID } from "./asset.js";

/*::
export type CharacterID = string;
export type CharacterPronoun =
  | { enabled: false }
  | { enabled: true, object: string, possessive: string };
export type CharacterHitDie = { size: number, count: number };
export type CharacterClass = { class: string, subclass: ?string, count: number };
export type CharacterACBonus = { reason: string, bonus: number };
export type Character = {
  id: CharacterID,
  playerId: UserID,
  gameId: GameID,

  name: string,
  pronouns: CharacterPronoun,

  levels: $ReadOnlyArray<CharacterClass>,
  backgroundDescription: string,

  maxHitpoints: number,
  hitDice: $ReadOnlyArray<CharacterHitDie>,

  sizeCategory: 'small' | 'medium',
  speed: number,

  baseAC: number,
  baseACReason: string,
  acBonuses: $ReadOnlyArray<CharacterACBonus>,

  initiativeIconAssetId: ?AssetID,

  alive: ?('yes' | 'no' | 'maybe'),

};
*/

export const castCharacterId/*: Cast<CharacterID>*/ = castString;
export const castCharacter/*: Cast<Character>*/ = createObjectCaster({
  id: castCharacterId,
  playerId: sm.castUserId,
  gameId: castGameId,

  name: c.str,
  pronouns: (v)/*: { enabled: false } | { enabled: true, object: string, possessive: string  }*/ => {
    const obj = castObject(v);
    const enabled = castBoolean(obj['enabled']);
    if (!enabled)
      return { enabled: false };
    return { enabled: true, object: castString(obj['object']), possessive: castString(obj['possessive']) };
  },

  levels: c.arr(c.obj({
    class: c.str,
    subclass: c.maybe(c.str),
    count: c.num,
  })),
  backgroundDescription: c.str,

  maxHitpoints: c.num,
  hitDice: c.arr(c.obj({ size: c.num, count: c.num })),

  sizeCategory: c.enums(['small', 'medium']),
  speed: c.num,

  baseAC: c.num,
  baseACReason: c.str,
  acBonuses: c.arr(c.obj({ reason: c.str, bonus: c.num })),
  
  initiativeIconAssetId: c.maybe(castAssetID),

  alive: c.maybe(c.enums(['yes', 'no', 'maybe']))
});

/*::
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
