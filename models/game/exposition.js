// @flow strict

import { c } from "@lukekaalim/cast";
import { castRichText } from "./wiki/richText.js";
import {
  castLocationResourceReference,
  castMiniTheaterResourceReference,
  castNPCResourceReference,
} from "./references.js";
import { castAssetID } from "../asset.js";
import { castMiniTheaterId } from "./miniTheater/miniTheater.js";
import { castMiniQuaternion, castMiniVector } from "./miniTheater/primitives.js";
import { castJSONSerializedNode } from "../prose.js";

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
} from "./references";
import type { MiniTheaterID } from "./miniTheater";
import type { MiniQuaternion, MiniVector } from "./miniTheater/primitives";
import type { JSONNode } from "prosemirror-model";

export type ExpositionSubject = 
  | LocationResourceReference
  | NPCResourceReference
  | { type: 'none' }
  | { type: 'title', title: string, subtitle: JSONNode }
  | { type: 'caption', caption: JSONNode }
  | { type: 'description', description: JSONNode }
  | { type: 'annotation', annotation: JSONNode }

export type ExpositionBackground =
  | { type: 'mini-theater', miniTheaterId: MiniTheaterID, position: MiniVector, rotation: MiniQuaternion }
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
  'title': c.obj({ type: c.lit('title'), title: c.str, subtitle: castJSONSerializedNode }),
  'caption': c.obj({ type: c.lit('caption'), caption: castJSONSerializedNode }),
  'description': c.obj({ type: c.lit('description'), description: castJSONSerializedNode }),
  'annotation': c.obj({ type: c.lit('annotation'), annotation: castJSONSerializedNode }),
  'none': c.obj({ type: c.lit('none') })
})
export const castExpositionBackground/*: Cast<ExpositionBackground>*/ = c.or('type', {
  'mini-theater': c.obj({
    type: c.lit('mini-theater'),
    miniTheaterId: castMiniTheaterId,
    position: castMiniVector,
    rotation: castMiniQuaternion
  }),
  'image': c.obj({ type: c.lit('image'), assetId: castAssetID }),
  'color': c.obj({ type: c.lit('color'), color: c.str }),
})

export const castExposition/*: Cast<Exposition>*/ = c.obj({
  background: castExpositionBackground,
  subject: castExpositionSubject,
  description: castRichText,
});
