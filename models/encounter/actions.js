// @flow strict
/*:: import type { Cast } from "@lukekaalim/cast";*/
/*:: import type { MiniID, CharacterMini, MonsterMini } from "./mini.js";*/
/*:: import type { MonsterID } from "../character.js";*/
/*:: import type { Vector3D } from "./map.js";*/
import { c } from '@lukekaalim/cast';
import { castMiniId } from './mini.js';
import { castVector3D } from './map.js';

/*::
// Player Actions
export type DamageAction = {
  type: 'damage',
  miniId: MiniID,
  hitpoints: number,
};
export type HealAction = {
  type: 'heal',
  miniId: MiniID,
  hitpoints: number,
};
export type GrantTempAction = {
  type: 'grant-temp',
  miniId: MiniID,
  tempHitpoints: number,
};
export type AddTagAction = {
  type: 'add-tag',
  miniId: MiniID,
  tagName: string,
};
export type RemoveTagAction = {
  type: 'remove-tag',
  miniId: MiniID,
  tagName: string,
};
export type MoveAction = {
  type: 'move',
  miniId: MiniID,
  newPosition: Vector3D,
};
*/
export const castDamageAction/*: Cast<DamageAction>*/ = c.obj({
  type: c.lit('damage'),
  miniId: castMiniId,
  hitpoints: c.num,
})
export const castHealAction/*: Cast<HealAction>*/ = c.obj({
  type: c.lit('heal'),
  miniId: castMiniId,
  hitpoints: c.num,
})
export const castGrantTempAction/*: Cast<GrantTempAction>*/ = c.obj({
  type: c.lit('grant-temp'),
  miniId: castMiniId,
  tempHitpoints: c.num,
})
export const castRemoveTagAction/*: Cast<RemoveTagAction>*/ = c.obj({
  type: c.lit('remove-tag'),
  miniId: castMiniId,
  tagName: c.str,
})
export const castAddTagAction/*: Cast<AddTagAction>*/ = c.obj({
  type: c.lit('add-tag'),
  miniId: castMiniId,
  tagName: c.str,
})
export const castMoveAction/*: Cast<MoveAction>*/ = c.obj({
  type: c.lit('move'),
  miniId: castMiniId,
  newPosition: castVector3D,
})

/*::
// GM Actions
export type AddMonsterMiniAction = {
  type: 'add-monster-mini',
  monsterId: MonsterID,
  hitpoints: number,
  tempHitpoints: number,
};
export type AddAdhocMonsterMiniAction = {
  type: 'add-adhoc-monster-mini',
  mini: MonsterMini,
};
export type AddCharacterMiniAction = {
  type: 'add-chararcter-mini',
  mini: CharacterMini,
  hitpoints: number,
  tempHitpoints: number,
};
export type RollMiniInitiativeAction = {
  type: 'roll-mini-intiative',
  miniId: MiniID,
  initiative: number,
};
export type ExitMiniInitiativeAction = {
  type: 'exit-mini-initiative',
  miniId: MiniID,
};
export type RemoveMiniAction = {
  type: 'remove-mini',
  miniId: MiniID,
};
export type AdvanceTurnAction = {
  type: 'advance-turn',
  turnsToAdvance: number,
};
export type ChangeVisability = {
  type: 'change-visibility',
  miniId: MiniID,
  isVisible: boolean,
};

export type PlaceProp = {

};
*/



/*::
export type EncounterAction =
  | DamageAction
  | HealAction
  | GrantTempAction
  | AddTagAction
  | RemoveTagAction
  | MoveAction
*/

export const castEncounterAction/*: Cast<EncounterAction>*/ = c.or('type', {
  'add-tag': castAddTagAction,
  'remove-tag': castRemoveTagAction,
  'grant-temp': castGrantTempAction,
  'heal': castHealAction,
  'damage': castDamageAction,
  'move': castMoveAction,
});