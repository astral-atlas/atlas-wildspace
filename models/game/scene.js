// @flow strict

import { c } from "@lukekaalim/cast";
import { castNonPlayerCharacterID } from "./character.js";
import { castLocationId } from "./location.js";
import { castEncounterId } from "../encounter.js";
import { castExpositionId } from "./exposition.js";
import { castMiniTheaterId } from "./miniTheater.js";

/*::
import type { Cast } from "@lukekaalim/cast";

import type { EncounterID } from "../encounter";
import type { NonPlayerCharacterID } from "./character.js";
import type { LocationID } from "./location.js";
import type { MiniTheaterID } from "./miniTheater.js";
import type { ExpositionID } from "./exposition.js";

export type SceneID = string;
export type Scene = {
  id: SceneID,
  title: string,

  content:
    | { type: 'none' }
    | { type: 'mini-theater', miniTheaterId: MiniTheaterID }
    | { type: 'exposition', expositionId: ExpositionID  }
  ,
};
*/

export const castSceneId/*: Cast<SceneID>*/ = c.str;
export const castScene/*: Cast<Scene>*/ = c.obj({
  id: castSceneId,
  title: c.str,

  content: c.or('type', {
    'none': c.obj({ type: (c.lit('none')/*: Cast<'none'>*/) }),
    'exposition': c.obj({ type: (c.lit('exposition')/*: Cast<'exposition'>*/), expositionId: castExpositionId }),
    'mini-theater': c.obj({ type: (c.lit('mini-theater')/*: Cast<'mini-theater'>*/), miniTheaterId: castMiniTheaterId }),
  })
})