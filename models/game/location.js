// @flow strict

import { c } from "@lukekaalim/cast";
import { castAssetID } from "../asset.js";

/*::
import type { Cast } from "@lukekaalim/cast";
import type { Graphic2DRef } from "./graphics.js";
import type { PlainTextDocumentID } from "./document";
import type { AssetID } from "../asset";

export type LocationID = string;
export type Location = {
  id: LocationID,

  title: string,
  description:
    | { type: 'plaintext', plaintext: string },
  background:
    | { type: 'image', imageAssetId: ?AssetID }
    | { type: 'color', color: string },

  tags: $ReadOnlyArray<string>,
};
*/
export const castLocationId/*: Cast<LocationID>*/ = c.str;
export const castLocation/*: Cast<Location>*/ = c.obj({
  id: castLocationId,

  title: c.str,
  description: c.or('type', {
    'plaintext': c.obj({ type: c.lit('plaintext'), plaintext: c.str }),
  }),
  background: c.or('type', {
    'image': c.obj({ type: c.lit('image'), imageAssetId: c.maybe(castAssetID) }),
    'color': c.obj({ type: c.lit('color'), color: c.str }),
  }),

  tags: c.arr(c.str),
})