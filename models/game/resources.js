// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { AssetID } from "../asset";
*/

import { c } from "@lukekaalim/cast";
import { castAssetID } from "../asset.js";

/*::
export type TextureResourceID = string;
export type TextureResource = {
  id: TextureResourceID,
  name: string,
  assetId: AssetID,
}
*/
export const castTextureResourceID/*: Cast<TextureResourceID>*/ = c.str;
export const castTextureResource/*: Cast<TextureResource>*/ = c.obj({
  id: castTextureResourceID,
  name: c.str,
  assetId: castAssetID,
})

export * from './resources/index.js'