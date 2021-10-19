// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Monster, MonsterID, CharacterID } from "../character.js"; */
/*:: import type { GameID } from '../game.js'; */
/*:: import type { Vector3D } from './map.js'; */
import { c } from '@lukekaalim/cast';
import { castMonsterId, castCharacterId } from '../character.js';
import { castVector3D } from './map.js';

/*::
export type MiniID = string;
export type MonsterMini = {
  type: 'monster',
  id: MiniID,
  name: string,
  position: Vector3D,
  visible: boolean,
  monsterId: MonsterID,

  conditions: $ReadOnlyArray<string>,
  hitpoints: number,
  maxHitpoints: number,
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
*/

export const castMiniId/*: Cast<MiniID>*/ = c.str;

export const castMonsterMini/*: Cast<MonsterMini>*/ = c.obj({
  type: c.lit('monster'),
  id: castMiniId,
  name: c.str,
  position: castVector3D,
  visible: c.bool,
  monsterId: castMonsterId,

  conditions: c.arr(c.str),
  hitpoints: c.num,
  maxHitpoints: c.num,
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