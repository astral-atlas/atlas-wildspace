// @flow strict
import { c } from "@lukekaalim/cast";
import { castAssetID } from "../asset.js";
import { castJSONSerializedNode } from "../prose.js";

/*::
import type { Cast } from "@lukekaalim/cast";
import type { AssetID } from "../asset";
import type { JSONNode } from "prosemirror-model";

export type CharacterImageID = string;
export type CharacterImage = {
  ...(
    | { type: 'dialogue', dialogueImageAssetId: AssetID }
    | { type: 'combat', combatImageAssetId: AssetID }
  ),
  id: CharacterImageID,
  title: string,
};
*/
export const castCharacterImageId/*: Cast<CharacterImageID>*/ = c.str;
export const castCharacterImage/*: Cast<CharacterImage>*/ = c.or('type', {
  'dialogue': c.obj({
    type: c.lit('dialogue'),
    dialogueImageAssetId: castAssetID, 
    title: c.str,
    id: c.str
  }),
  'combat': c.obj({
    type: c.lit('combat'),
    combatImageAssetId: castAssetID,
    title: c.str,
    id: c.str
  }),
})

/*::

export type NonPlayerCharacterID = string;
export type NonPlayerCharacter = {
  id: NonPlayerCharacterID,

  name: string,

  description: JSONNode,
  
  images: $ReadOnlyArray<CharacterImage>,

  tags: $ReadOnlyArray<string>,
}
*/

export const castNonPlayerCharacterID/*: Cast<NonPlayerCharacterID>*/ = c.str;
export const castNonPlayerCharacter/*: Cast<NonPlayerCharacter>*/ = c.obj({
  id: castNonPlayerCharacterID,

  name: c.str,
  description: castJSONSerializedNode,
  
  images: c.arr(castCharacterImage),

  tags: c.arr(c.str),
})