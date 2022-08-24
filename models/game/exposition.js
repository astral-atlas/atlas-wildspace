// @flow strict

import { c } from "@lukekaalim/cast";
import { castNonPlayerCharacterID } from "./character.js";
import { castCharacterId } from "../character.js";
import { castLocationId } from "./location.js";
import { castRichText } from "./wiki/richText.js";

/*::
import type { Cast } from "@lukekaalim/cast";
import type { CharacterID } from "../character";
import type { NonPlayerCharacterID } from "./character";
import type { LocationID } from "./location";
import type { RichText } from "./wiki/richText";

export type ExpositionSubject = 
  | { type: 'npc', npcId: NonPlayerCharacterID }
  | { type: 'location', locationId: LocationID }
  | { type: 'none' }

export type ExpositionBackground = 
  | { type: 'location', locationId: LocationID }
  | { type: 'color', color: string }

export type Exposition = {
  background: ExpositionBackground,
  subject: ExpositionSubject,
  description: RichText,
};
*/

export const castExpositionSubject/*: Cast<ExpositionSubject>*/ = c.or('type', {
  'npc': c.obj({ type: c.lit('npc'), npcId: castNonPlayerCharacterID }),
  'location': c.obj({ type: c.lit('location'), locationId: castLocationId }),
  'none': c.obj({ type: c.lit('none') })
})
export const castExpositionBackground/*: Cast<ExpositionBackground>*/ = c.or('type', {
  'location': c.obj({ type: c.lit('location'), locationId: castLocationId }),
  'color': c.obj({ type: c.lit('color'), color: c.str }),
})

export const castExposition/*: Cast<Exposition>*/ = c.obj({
  background: castExpositionBackground,
  subject: castExpositionSubject,
  description: castRichText,
});
