// @flow strict
/*::
import type { AssetID } from "../../asset";
import type { GameMetaResource } from "../meta";
import type { Cast } from "@lukekaalim/cast";
*/
import { c } from "@lukekaalim/cast";
import { castAssetID } from "../../asset.js";
import { castGameMetaResource } from "../meta.js";

/*::
export type ModelResourcePath = $ReadOnlyArray<string>;

export type ModelResourceID = string;
export type ModelResource = GameMetaResource<{|
  assetId: AssetID,
  format: 'gltf',

  previewCameraPath: ?ModelResourcePath,
|}, ModelResourceID>;

export type ModelResourcePartID = string;
export type ModelResourcePart = GameMetaResource<{|
  modelResourceId: ModelResourceID,
  path: ModelResourcePath,
|}, ModelResourcePartID>;
*/
export const castModelResourceId/*: Cast<ModelResourceID>*/ = c.str;
export const castModelResourcePath/*: Cast<ModelResourcePath>*/ = c.arr(c.str);
export const castModelResource/*: Cast<ModelResource>*/ = castGameMetaResource(castModelResourceId, c.obj({
  assetId: castAssetID,
  format: c.enums(['gltf']),
  previewCameraPath: c.maybe(castModelResourcePath),
}))

export const castModelResourcePartID/*: Cast<ModelResourcePartID>*/ = c.str;
export const castModelResourcePart/*: Cast<ModelResourcePart>*/ = castGameMetaResource(castModelResourcePartID, c.obj({
  modelResourceId: castModelResourceId,
  path: castModelResourcePath,
}));
