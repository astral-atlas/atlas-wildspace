// @flow strict

import { useEffect, useState } from "@lukekaalim/act";
import {
  Camera,
  Color,
  PerspectiveCamera,
  Vector2,
  WebGLRenderer,
} from "three";
import { getObject3DForModelResourcePath } from "./modelResourceUtils";

/*::
import type {
  ModelResource,
  ModelResourceID,
} from "@astral-atlas/wildspace-models";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ModelResourceAssetMap } from "./useModelResourceAssetMap";
import type { ModelResourcePath } from "../../models/game/resources";
*/

/*::
export type ModelResourcePreviewIconMap = Map<string, {
  previewIconURL: string,
}>
*/


export const useModelResourceAssetsIconURL = (
  assetPaths/*: Map<string, { asset: GLTF, path: ?ModelResourcePath }>*/,
  size/*: Vector2*/ = new Vector2(256, 256),
)/*: ModelResourcePreviewIconMap*/ => {
  const [iconMap, setIconMap] = useState(new Map());

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = size.x;
    canvas.height = size.y;
    const renderer = new WebGLRenderer({ canvas });

    const iconPromises = Promise.all([...assetPaths]
      .map(async ([id , { asset, path }]) => {
        const iconScene = asset.scene.clone(true);

        const defaultCamera = new PerspectiveCamera();
        iconScene.add(defaultCamera);

        const modelPreviewCamera = path
          && getObject3DForModelResourcePath(iconScene, path)

        const previewCamera = (modelPreviewCamera instanceof Camera && modelPreviewCamera)
          || defaultCamera;
        
        if (previewCamera instanceof PerspectiveCamera) {
          previewCamera.aspect = size.x / size.y;
          previewCamera.updateProjectionMatrix();
        }

        const blob = await new Promise(r => {
          renderer
          renderer.render(iconScene, previewCamera);
          canvas.toBlob(blob => r(blob))
        });

        const previewIconURL = URL.createObjectURL(blob);
        return [id, { previewIconURL }];
      }));
    
    iconPromises.then(entries => {
      setIconMap(new Map(entries));
      return entries;
    });

    return () => {
      renderer.dispose();
      iconPromises.then(entries => {
        entries.map(([id, m]) => URL.revokeObjectURL(m.previewIconURL))
      })
    }
  }, [assetPaths])

  return iconMap;
};
