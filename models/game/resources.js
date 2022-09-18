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

/*::
export type ModelResourcePath = $ReadOnlyArray<string>;

export type ModelResourceID = string;
export type ModelResource = {
  id: ModelResourceID,
  name: string,
  assetId: AssetID,
  format: 'gltf',

  previewCameraPath: ?ModelResourcePath,
}
*/
export const castModelResourceId/*: Cast<ModelResourceID>*/ = c.str;
export const castModelResourcePath/*: Cast<ModelResourcePath>*/ = c.arr(c.str);
export const castModelResource/*: Cast<ModelResource>*/ = c.obj({
  id: castModelResourceId,
  name: c.str,
  assetId: castAssetID,
  format: c.enums(['gltf']),

  previewCameraPath: c.maybe(castModelResourcePath),
})