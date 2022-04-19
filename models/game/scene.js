// @flow strict

import { c } from "@lukekaalim/cast";
import { castNonPlayerCharacterID } from "./character.js";
import { castLocationId } from "./location.js";

/*::
import type { Cast } from "@lukekaalim/cast";

import type { EncounterID } from "../encounter";
import type { NonPlayerCharacterID } from "./character.js";
import type { LocationID } from "./location.js";

export type SceneRef =
  | { type: 'exposition', ref: ExpositionSceneID }
  | { type: 'encounter', ref: ExpositionSceneID }


export type ExpositionSceneID = string;
export type ExpositionScene = {
  id: ExpositionSceneID,

  title: string,
  subject:
    | { type: 'none' }
    | { type: 'npc', npc: NonPlayerCharacterID }
    | { type: 'location', location: LocationID },

  tags: $ReadOnlyArray<string>,
};

export type EncounterSceneID = string;
export type EncounterScene = {
  id: EncounterSceneID,
  title: string,

  encounterId: EncounterID,

  tags: $ReadOnlyArray<string>,
}
*/

export const castExpositionSceneID/*: Cast<ExpositionSceneID>*/ = c.str;
export const castExpositionScene/*: Cast<ExpositionScene>*/ = c.obj({
  id: castExpositionSceneID,

  title: c.str,
  subject: c.or('type', {
    'none': c.obj({ type: c.lit('none' )}),
    'npc': c.obj({ type: c.lit('npc'), npc: castNonPlayerCharacterID }),
    'location': c.obj({ type: c.lit('location'), location: castLocationId }),
  }),

  tags: c.arr(c.str),
})

export const castSceneRef/*: Cast<SceneRef>*/ = c.or('type', {
  'exposition': c.obj({ type: c.lit('exposition'), ref: castExpositionSceneID })
})