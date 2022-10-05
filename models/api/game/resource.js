// @flow strict

import { c } from "@lukekaalim/cast";

import { createAdvancedCRUDGameAPI } from "./meta.js";
import {
  castModelResource,
  castModelResourcePath,
} from "../../game.js";
import { castAssetID } from "../../asset.js";

/*::
import type { AssetID } from "../../asset";
import type {
  ModelResource,
  ModelResourceID,
  ModelResourcePath,
  TextureResource,
  TextureResourceID,
} from "../../game";
import type { AdvancedGameCRUDAPI } from "./meta";
import type { ResourceDescription } from "@lukekaalim/net-description/resource";

export type GameResourceAPI = {|
  '/games/resources/models': AdvancedGameCRUDAPI<{
    resource: ModelResource,
    resourceName: 'model',
    resourceId: ModelResourceID,
    resourceIdName: 'modelId',
  
    resourcePostInput: {
      name: string,
      assetId: AssetID,
      format: 'gltf',
      previewCameraPath: ?ModelResourcePath
    },
    resourcePutInput: {
      name: string,
      previewCameraPath: ?ModelResourcePath
    },
  }>,
|};
*/

export const resourceAPI = {
  '/games/resources/models': (createAdvancedCRUDGameAPI({
    path: '/games/resources/models' ,
    resourceName: 'model',
    resourceIdName: 'modelId',
    castResource: castModelResource,

    castPostResource: c.obj({
      name: c.str,
      assetId: castAssetID,
      format: c.enums(['gltf']),
      previewCameraPath: c.maybe(castModelResourcePath)
    }),
    castPutResource: c.obj({
      name: c.str,
      previewCameraPath: c.maybe(castModelResourcePath)
    }),
  })/*: ResourceDescription<GameResourceAPI['/games/resources/models']>*/)
};