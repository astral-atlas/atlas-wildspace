// @flow strict
/*::
import type { GamePage, RoomPage } from "@astral-atlas/wildspace-models";
import type { MiniTheaterRenderResources } from "../useMiniTheaterResources";
*/

import { useEffect, useMemo, useState } from "@lukekaalim/act";
import { TextureLoader } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const useRoomPageMiniTheaterResources = (
  game/*: GamePage*/,
  room/*: RoomPage*/,
)/*: MiniTheaterRenderResources*/ => {
  const [loadingAssets, setLoadingAssets] = useState(true);

  const maps = useMemo(() => {
    const assets = new Map([game.assets, room.assets].flat(1).map(a => [a.description.id, a]))
    const characters = new Map(game.characters.map(c => [c.id, c]));
    const monsterMasks = new Map(game.monsterMasks.map(m => [m.id, m]));
    const terrainProps = new Map(room.resources.terrainProps.map(t => [t.id, t]));
    const modelResources = new Map(room.resources.modelResources.map(m => [m.id, m]));

    return { assets, characters, monsterMasks, terrainProps, modelResources }
  }, [game.assets, game.characters, game.monsterMasks, game]);

  const [threeMaps, setThreeMaps] = useState({
    meshMap: new Map(),
    textureMap: new Map(),
    objectMap: new Map(),
    materialMap: new Map(),
  });

  useEffect(() => {
    const load = async () => {
      setLoadingAssets(true);
      const textureLoader = new TextureLoader();
      const gltfLoader = new GLTFLoader();

      const textureAssets = [
        ...game.characters.map(c => c.initiativeIconAssetId),
        ...game.monsterMasks.map(m => m.initiativeIconAssetId)
      ]
        .map(assetId => assetId ? maps.assets.get(assetId) : null)
        .filter(Boolean);

      const modelResourceAsset = [
        room.resources.modelResources.map(m => m.assetId)
      ]
        .flat(1)
        .map(assetId => maps.assets.get(assetId))
        .filter(Boolean)

      const objectMap = new Map(await Promise.all(modelResourceAsset.map(async a => [
        a.description.id,
        (await gltfLoader.loadAsync(a.downloadURL)).scene,
      ])))

      const textureMap = new Map(await Promise.all(textureAssets.map(async i => [
        i.description.id,
        await textureLoader.loadAsync(i.downloadURL)
      ])));

      setThreeMaps({
        meshMap: new Map(),
        textureMap,
        materialMap: new Map(),
        objectMap,
      })

      setLoadingAssets(false);
    };
    load();
  }, [maps.assets, game.characters, game.monsterMasks, room])

  return useMemo(() => ({
    ...maps,
    ...threeMaps,
    loadingAssets
  }), [maps, loadingAssets, threeMaps])
};