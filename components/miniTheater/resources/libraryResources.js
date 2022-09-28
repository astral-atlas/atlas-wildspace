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
  const { assets, characters, monsterMasks, terrainProps } = useMemo(() => {
    const assets = new Map(library.assets.map(a => [a.description.id, a]))
    const characters = new Map(library.characters.map(c => [c.id, c]));
    const monsterMasks = new Map(library.monsterActors.map(actor => {
      const monster = library.monsters.find(m => m.id === actor.monsterId);
      if (!monster)
        return null;
      return [actor.id, createMaskForMonsterActor(monster, actor)]
    }).filter(Boolean));
    const terrainProps = new Map(library.terrainProps.map(t => [t.id, t]));

    return { assets, characters, monsterMasks, terrainProps }
  }, [library.assets, library.characters, library.monsterActors, library.monsters, library.terrainProps]);

  const [materialMap, setMaterialMap] = useState(new Map());
  const [meshMap] = useState(new Map());
  const [textureMap, setTextureMap] = useState(new Map());
  const [loadingAssets, setLoadingAssets] = useState(true);

  useEffect(() => {
    const loader = new GLTFLoader();
    const textureLoader = new TextureLoader();
    const load = async () => {
      setLoadingAssets(true);
      const iconAssetInfo = [
        library.characters.map(c => c.initiativeIconAssetId),
        library.monsters.map(m => m.initiativeIconAssetId)
      ]
        .flat(1)
        .map(assetId => assetId ? assets.get(assetId) : null)
        .filter(Boolean);
      
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

    materialMap,
    meshMap,
    textureMap,

    loadingAssets,
  }), [library, materialMap, textureMap, loadingAssets])
}