// @flow strict
/*::
import type { GamePage, RoomPage } from "@astral-atlas/wildspace-models";
import type { MiniTheaterRenderResources } from "../useMiniTheaterResources";
*/

import { useEffect, useMemo, useState } from "@lukekaalim/act";
import { TextureLoader } from "three";

export const useRoomPageMiniTheaterResources = (
  game/*: GamePage*/,
  room/*: RoomPage*/,
)/*: MiniTheaterRenderResources*/ => {
  const [loadingAssets, setLoadingAssets] = useState(false);

  const maps = useMemo(() => {
    const assets = new Map([game.assets, room.assets].flat(1).map(a => [a.description.id, a]))
    const characters = new Map(game.characters.map(c => [c.id, c]));
    const monsterMasks = new Map(game.monsterMasks.map(m => [m.id, m]));
    const terrainProps = new Map(room.resources.terrainProps.map(t => [t.id, t]));

    return { assets, characters, monsterMasks, terrainProps }
  }, [game.assets, game.characters, game.monsterMasks, game]);

  const [threeMaps, setThreeMaps] = useState({
    meshMap: new Map(),
    textureMap: new Map(),
    materialMap: new Map(),
  });

  useEffect(() => {
    const load = async () => {
      setLoadingAssets(true);
      const textureLoader = new TextureLoader();

      const textureAssets = [
        ...game.characters.map(c => c.initiativeIconAssetId),
        ...game.monsterMasks.map(m => m.initiativeIconAssetId)
      ]
        .map(assetId => assetId ? maps.assets.get(assetId) : null)
        .filter(Boolean);

      const textureMap = new Map(await Promise.all(textureAssets.map(async i => [
        i.description.id,
        await textureLoader.loadAsync(i.downloadURL)
      ])));

      setThreeMaps({
        meshMap: new Map(),
        textureMap,
        materialMap: new Map(),
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