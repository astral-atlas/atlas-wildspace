// @flow strict

import { c } from "@lukekaalim/cast";
import { castMiniTheaterId } from "./miniTheater.js";
import { castAudioPlaylistId } from "../audio.js";
import { castExposition } from "./exposition.js";

/*::
import type { Cast } from "@lukekaalim/cast";

import type { EncounterID } from "../encounter";
import type { NonPlayerCharacterID } from "./character.js";
import type { LocationID } from "./location.js";
import type { MiniTheaterID } from "./miniTheater.js";
import type { AssetID } from "../asset";
import type { AudioPlaylistID } from "../audio";
import type { Exposition } from "./exposition";

export type SceneID = string;
export type SceneContent =
  | { type: 'none' }
  | { type: 'mini-theater', miniTheaterId: MiniTheaterID }
  | { type: 'exposition', exposition: Exposition  }

export type Scene = {
  id: SceneID,
  title: string,

  playlist: ?AudioPlaylistID,

  content: SceneContent,
};
*/

export const castSceneId/*: Cast<SceneID>*/ = c.str;
export const castSceneContent/*: Cast<SceneContent>*/ = c.or('type', {
  'none': c.obj({ type: (c.lit('none')/*: Cast<'none'>*/) }),
  'exposition': c.obj({ type: (c.lit('exposition')/*: Cast<'exposition'>*/), exposition: castExposition }),
  'mini-theater': c.obj({ type: (c.lit('mini-theater')/*: Cast<'mini-theater'>*/), miniTheaterId: castMiniTheaterId }),
});
export const castScene/*: Cast<Scene>*/ = c.obj({
  id: castSceneId,
  title: c.str,
  
  playlist: c.maybe(castAudioPlaylistId),

  content: castSceneContent,
})
