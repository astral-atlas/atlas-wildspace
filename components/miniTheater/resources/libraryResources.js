// @flow strict

import { createMaskForMonsterActor } from "@astral-atlas/wildspace-models";
import { useEffect, useMemo, useState } from "@lukekaalim/act";

import { SpriteMaterial, TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/*::
import type { MiniTheaterRenderResources } from "../useMiniTheaterResources";
import type { LibraryData } from "@astral-atlas/wildspace-models";
*/


export const useLibraryMiniTheaterResources = (
  library/*: LibraryData*/,
)/*: MiniTheaterRenderResources*/ => {
  const { assets, characters, monsterMasks, terrainProps, modelResources } = useMemo(() => {
    const assets = new Map(library.assets.map(a => [a.description.id, a]))
    const characters = new Map(library.characters.map(c => [c.id, c]));
    const monsterMasks = new Map(library.monsterActors.map(actor => {
      const monster = library.monsters.find(m => m.id === actor.monsterId);
      if (!monster)
        return null;
      return [actor.id, createMaskForMonsterActor(monster, actor)]
    }).filter(Boolean));
    const terrainProps = new Map(library.terrainProps.map(t => [t.id, t]));
    const modelResources = new Map(library.modelResources.map(m => [m.id, m]))

    return { assets, characters, monsterMasks, terrainProps, modelResources }
  }, [
    library.assets, library.characters,
    library.monsterActors, library.monsters,
    library.terrainProps, library.modelResources
  ]);

  const [materialMap, setMaterialMap] = useState(new Map());
  const [meshMap] = useState(new Map());
  const [textureMap, setTextureMap] = useState(new Map());
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [objectMap, setObjectMap] = useState(new Map());

  useEffect(() => {
    const textureLoader = new TextureLoader();
    const gltfLoader = new GLTFLoader();
    const load = async () => {
      setLoadingAssets(true);
      const iconAssetInfo = [
        library.characters.map(c => c.initiativeIconAssetId),
        library.monsters.map(m => m.initiativeIconAssetId)
      ]
        .flat(1)
        .map(assetId => assetId ? assets.get(assetId) : null)
        .filter(Boolean);
      const modelResourceAsset = [
        library.modelResources.map(m => m.assetId)
      ]
        .flat(1)
        .map(assetId => assets.get(assetId))
        .filter(Boolean)

      const objectMap = new Map(await Promise.all(modelResourceAsset.map(async a => [
        a.description.id,
        (await gltfLoader.loadAsync(a.downloadURL)).scene,
      ])))
      
      const textureMap = new Map(await Promise.all(iconAssetInfo.map(async assetInfo => {
        return [
          assetInfo.description.id,
          await textureLoader.loadAsync(assetInfo.downloadURL)]
      })))
      const materialMap = new Map(iconAssetInfo.map(assetInfo => {
        return [
          assetInfo.description.id,
          new SpriteMaterial({ map: textureMap.get(assetInfo.description.id) })]
      }).filter(Boolean));
      
      setObjectMap(objectMap);
      setMaterialMap(materialMap);
      setTextureMap(textureMap);
      setLoadingAssets(false);
    }
    load();
  }, [assets, terrainProps, library.characters, library.monsters]);


  return useMemo(() => ({
    assets,
    characters,
    monsterMasks,
    terrainProps,
    modelResources,

    materialMap,
    meshMap,
    textureMap,
    objectMap,

    loadingAssets,
  }), [library, materialMap, textureMap, modelResources, loadingAssets, objectMap])
}