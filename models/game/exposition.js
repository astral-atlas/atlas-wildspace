// @flow strict

import { c } from "@lukekaalim/cast";
import { castRichText } from "./wiki/richText.js";
import {
  castLocationResourceReference,
  castMiniTheaterResourceReference,
  castNPCResourceReference,
} from "./resource.js";
import { castAssetID } from "../asset.js";

/*::
import type { Cast } from "@lukekaalim/cast";
import type { CharacterID } from "../character";
import type { NonPlayerCharacterID } from "./character";
import type { LocationID } from "./location";
import type { RichText } from "./wiki/richText";
import type { AssetID } from "../asset";
import type {
  LocationResourceReference,
  MiniTheaterResourceReference,
  NPCResourceReference,
} from "./resource";
import type { MiniTheaterID } from "./miniTheater";

export type ExpositionSubject = 
  | LocationResourceReference
  | NPCResourceReference
  | { type: 'none' }

export type ExpositionBackground =
  | MiniTheaterResourceReference
  | { type: 'image', assetId: AssetID }
  | { type: 'color', color: string }

export type Exposition = {
  background: ExpositionBackground,
  subject: ExpositionSubject,
  description: RichText,
};
*/

export const castExpositionSubject/*: Cast<ExpositionSubject>*/ = c.or('type', {
  'npc': castNPCResourceReference,
  'location': castLocationResourceReference,
  'none': c.obj({ type: c.lit('none') })
})
export const castExpositionBackground/*: Cast<ExpositionBackground>*/ = c.or('type', {
  'mini-theater': castMiniTheaterResourceReference,
  'image': c.obj({ type: c.lit('image'), assetId: castAssetID }),
  'color': c.obj({ type: c.lit('color'), color: c.str }),
})

export const castExposition/*: Cast<Exposition>*/ = c.obj({
  background: castExpositionBackground,
  subject: castExpositionSubject,
  description: castRichText,
});
