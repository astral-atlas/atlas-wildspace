// @flow strict
/*::
import type { NonPlayerCharacter, NonPlayerCharacterID } from "./character";
import type { Location, LocationID } from "./location";
import type { MiniTheater, MiniTheaterID } from "./miniTheater";
import type { MagicItemID } from "./magicItem";
import type { SceneID } from "./scene";

import type { Cast } from "@lukekaalim/cast/main";
*/


import { c } from "@lukekaalim/cast";
import { castLocationId } from "./location.js";
import { castMiniTheaterId } from "./miniTheater/miniTheater.js";
import { castSceneId } from "./scene.js";
import { castNonPlayerCharacterID } from "./character.js";
import { castMagicItemId } from "./magicItem.js";

/*::
export type SceneResourceReference = {
  type: 'scene',
  sceneId: SceneID
}
export type MiniTheaterResourceReference = {
  type: 'mini-theater',
  miniTheaterId: MiniTheaterID
}
export type LocationResourceReference = {
  type: 'location',
  locationId: LocationID
}
export type NPCResourceReference = {
  type: 'npc',
  npcId: NonPlayerCharacterID
}
export type MagicItemResourceReference = {
  type: 'magic-item',
  magicItemId: MagicItemID
}

export type ResourceReference =
  | SceneResourceReference
  | MiniTheaterResourceReference
  | LocationResourceReference
  | NPCResourceReference
  | MagicItemResourceReference
*/

export const castSceneResourceReference/*: Cast<SceneResourceReference>*/ = c.obj({
  type: c.lit('scene'),
  sceneId: v => castSceneId(v),
});
export const castMiniTheaterResourceReference/*: Cast<MiniTheaterResourceReference>*/ = c.obj({
  type: c.lit('mini-theater'),
  miniTheaterId: castMiniTheaterId,
});
export const castLocationResourceReference/*: Cast<LocationResourceReference>*/ = c.obj({
  type: c.lit('location'),
  locationId: castLocationId,
});
export const castNPCResourceReference/*: Cast<NPCResourceReference>*/ = c.obj({
  type: c.lit('npc'),
  npcId: castNonPlayerCharacterID,
});
export const castMagicItemResourceReference/*: Cast<MagicItemResourceReference>*/ = c.obj({
  type: c.lit('magic-item'),
  magicItemId: castMagicItemId,
});


/*::
export type RoomResourceBlock = {
  miniTheaters: $ReadOnlyArray<MiniTheater>,
  locations: $ReadOnlyArray<Location>,
  npcs: $ReadOnlyArray<NonPlayerCharacter>
};
*/