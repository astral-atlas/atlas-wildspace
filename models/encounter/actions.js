// @flow strict
/*:: import type { MiniID } from "./mini.js";*/
/*:: import type { Cast } from "@lukekaalim/cast";*/
import { c } from '@lukekaalim/cast';
import { castMiniId } from './mini.js';

/*::
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

export type EncounterAction =
  | DamageAction
  | HealAction
  | GrantTempAction
  | AddTagAction
  | RemoveTagAction
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

export const castEncounterAction/*: Cast<EncounterAction>*/ = c.or('type', {
  'add-tag': castAddTagAction,
  'remove-tag': castRemoveTagAction,
  'grant-temp': castGrantTempAction,
  'heal': castHealAction,
  'damage': castDamageAction,
});