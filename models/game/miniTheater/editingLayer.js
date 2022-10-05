// @flow strict
import { castUserId } from "@astral-atlas/sesame-models";
import { c } from "@lukekaalim/cast";
import { castCharacterId } from "../../character.js";

/*::
import type { UserID } from "@astral-atlas/sesame-models/src/user";
import type { Cast } from "@lukekaalim/cast/main";
import type { CharacterID } from "../../character";


export type EditingLayerID = string;
export type EditingLayer = {
  id: EditingLayerID,
  name: string,
  visible: boolean,
  permissions:
    | { type: 'gm-in-game' }
    | { type: 'allowlist', userIds: $ReadOnlyArray<UserID> }
    | { type: 'players-in-game' }
  ,
  includes: $ReadOnlyArray<
    | { type: 'any' }
    | { type: 'any-terrain' }
    | { type: 'any-monsters' }
//    | { type: 'terrain-props', terrainProps: $ReadOnlyArray<TerrainPropID> }
    | { type: 'characters', characters: $ReadOnlyArray<CharacterID> }
//    | { type: 'monsters', monsterActors: $ReadOnlyArray<MonsterActorID> }
//    | { type: 'unique-player-characters' }
  >,
  placementRules: $ReadOnlyArray<
    | { type: 'unique-represents' }
  >
};
*/
const castIncludeAny = c.obj({
  type: c.lit('any'),
});
const castIncludeCharacter = c.obj({
  type: c.lit('characters'),
  characters: c.arr(castCharacterId)
});
const castIncludes/*: Cast<EditingLayer["includes"][number]>*/ = c.or('type', {
  'any': castIncludeAny,
  'any-terrain': c.obj({ type: c.lit('any-terrain') }),
  'any-monsters': c.obj({ type: c.lit('any-monsters') }),
  'characters': castIncludeCharacter
})

export const castEditingLayerID/*: Cast<EditingLayerID>*/ = c.str; 
export const castEditingLayer/*: Cast<EditingLayer>*/ = c.obj({
  id: castEditingLayerID,
  name: c.str,
  visible: c.bool,
  permissions: c.or('type', {
    'gm-in-game': c.obj({ type: c.lit('gm-in-game') }),
    'allowlist': c.obj({ type: c.lit('allowlist'), userIds: c.arr(castUserId) }),
    'players-in-game': c.obj({ type: c.lit('players-in-game') }),
  }),
  includes: c.arr(castIncludes),
  placementRules: c.arr(c.obj({
    type: c.enums(['unique-represents'])
  }))
})