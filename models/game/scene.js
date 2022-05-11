// @flow strict

import { c } from "@lukekaalim/cast";
import { castNonPlayerCharacterID } from "./character.js";
import { castLocationId } from "./location.js";
import { castEncounterId } from "../encounter.js";

/*::
import type { Cast } from "@lukekaalim/cast";

import type { EncounterID } from "../encounter";
import type { NonPlayerCharacterID } from "./character.js";
import type { LocationID } from "./location.js";

export type SceneRef =
  | { type: 'exposition', ref: ExpositionSceneID }
  | { type: 'encounter', ref: EncounterID }


export type ExpositionSceneID = string;
export type ExpositionScene = {
  id: ExpositionSceneID,

  title: string,
  subject:
    | { type: 'none' }
    | { type: 'npc', npc: NonPlayerCharacterID, location: LocationID }
    | { type: 'location', location: LocationID },

  description:
    | {| type: 'inherit' |}
    | {| type: 'none' |}
    | {| type: 'plaintext', plaintext: string |},

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
    'none':     c.obj({ type: (c.lit('none')/*: Cast<'none'>*/) }),
    'npc':      c.obj({ type: (c.lit('npc')/*: Cast<'npc'>*/), npc: castNonPlayerCharacterID, location: castLocationId }),
    'location': c.obj({ type: (c.lit('location')/*: Cast<'location'>*/), location: castLocationId }),
  }),
  description: c.or('type', {
    'none':     c.obj({ type: c.lit('none') }),
    'plaintext': c.obj({ type: c.lit('plaintext'), plaintext: c.str }),
    'inherit': c.obj({ type: c.lit('inherit') })
  }),

  tags: c.arr(c.str),
})

export const castSceneRef/*: Cast<SceneRef>*/ = c.or('type', {
  'exposition': c.obj({ type: (c.lit('exposition')/*: Cast<'exposition'>*/), ref: castExpositionSceneID }),
  'encounter': c.obj({ type: (c.lit('encounter')/*: Cast<'encounter'>*/), ref: castEncounterId }),
})