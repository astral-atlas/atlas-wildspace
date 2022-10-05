// @flow strict

import { useEffect, useState } from "@lukekaalim/act";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/*::
import type { AssetDownloadURLMap } from "../asset/map";
import type { ModelResourceID, ModelResource } from "@astral-atlas/wildspace-models";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
*/

/*::
export type ModelResourceAssetMap = Map<ModelResourceID, {
  model: ModelResource,
  asset: GLTF
}>
*/

export const useModelResourceAssetMap = (
  models/*: $ReadOnlyArray<ModelResource>*/,
  assets/*: AssetDownloadURLMap*/
)/*: [ModelResourceAssetMap, GLTFLoader]*/ => {
  const [modelAssets, setModelAssets] = useState/* ::<ModelResourceAssetMap>*/(new Map());
  const [loader] = useState(new GLTFLoader());

  useEffect(() => {
    Promise.all(models.map(async (model) => {
      try {
        const assetInfo = assets.get(model.assetId);
        if (!assetInfo)
          return null;
        const asset = await loader.loadAsync(assetInfo.downloadURL);
        return { asset, model };
      } catch (error) {
        console.warn(error);
        return null;
      }
    })).then(assets => {
      setModelAssets(new Map(assets.filter(Boolean).map(a => [a.model.id, a])))
    });
  }, [models]);

  return [modelAssets, loader];
}