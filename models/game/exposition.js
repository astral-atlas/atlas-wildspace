// @flow strict

import { c } from "@lukekaalim/cast";
import { castNonPlayerCharacterID } from "./character.js";
import { castCharacterId } from "../character.js";
import { castLocationId } from "./location.js";

/*::
import type { Cast } from "@lukekaalim/cast";
import type { CharacterID } from "../character";
import type { NonPlayerCharacterID } from "./character";
import type { LocationID } from "./location";

export type ExpositionID = string;
export type Exposition = {
  id: ExpositionID,
  name: string,

  subject:
    | { type: 'npc', npcId: NonPlayerCharacterID }
    | { type: 'character', characterId: CharacterID }
    | { type: 'location', locationId: LocationID }
    | { type: 'none' }
  ,

  // TODO: find a nice rich text format
  overrideText: ?string,
};
*/

export const castExpositionId/*: Cast<ExpositionID>*/ = c.str;
export const castExposition/*: Cast<Exposition>*/ = c.obj({
  id: castExpositionId,
  name: c.str,

  subject: c.or('type', {
    'npc':        c.obj({ type: (c.lit('npc')/*: Cast<'npc'>*/), npcId: castNonPlayerCharacterID }),
    'character':  c.obj({ type: (c.lit('character')/*: Cast<'character'>*/), characterId: castCharacterId }),
    'location':   c.obj({ type: (c.lit('location')/*: Cast<'location'>*/), locationId: castLocationId }),
    'none':       c.obj({ type: (c.lit('none')/*: Cast<'none'>*/) }),
  }),

  overrideText: c.maybe(c.str)
})