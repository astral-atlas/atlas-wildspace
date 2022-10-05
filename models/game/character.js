// @flow strict
import { c } from "@lukekaalim/cast";
import { castAssetID } from "../asset.js";

/*::
import type { Cast } from "@lukekaalim/cast";
import type { AssetID } from "../asset";

export type NonPlayerCharacterID = string;
export type NonPlayerCharacter = {
  id: NonPlayerCharacterID,

  name: string,

  description:
    | { type: 'plaintext', plaintext: string },
  dialoguePortrait:
    | { type: 'image', imageAssetId: AssetID }
    | { type: 'none' },

  tags: $ReadOnlyArray<string>,
}
*/

export const castNonPlayerCharacterID/*: Cast<NonPlayerCharacterID>*/ = c.str;
export const castNonPlayerCharacter/*: Cast<NonPlayerCharacter>*/ = c.obj({
  id: castNonPlayerCharacterID,

  name: c.str,
  description: c.or('type', {
    'plaintext': c.obj({ type: (c.lit('plaintext')/*: Cast<'plaintext'>*/), plaintext: c.str }),
  }),
  dialoguePortrait: c.or('type', {
    'image': c.obj({ type: (c.lit('image')/*: Cast<'image'>*/), imageAssetId: castAssetID }),
    'none': c.obj({ type: (c.lit('none')/*: Cast<'none'>*/) }),
  }),

  tags: c.arr(c.str),
})