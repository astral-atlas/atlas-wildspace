// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { AssetID } from "../../asset";
*/

import { c } from "@lukekaalim/cast";
import { castAssetID } from "../../asset.js";

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
export type SceneResourcePath = $ReadOnlyArray<string>;

export type SceneResourceID = string;
export type SceneResource = {
  id: SceneResourceID,
  name: string,
  assetId: AssetID,

  previewCameraPath: ?SceneResourcePath,
}
*/
export const castSceneResourceID/*: Cast<SceneResourceID>*/ = c.str;
export const castSceneResourcePath/*: Cast<SceneResourcePath>*/ = c.arr(c.str);
export const castSceneResource/*: Cast<SceneResource>*/ = c.obj({
  id: castTextureResourceID,
  name: c.str,
  assetId: castAssetID,

  previewCameraPath: c.maybe(castSceneResourcePath),
})