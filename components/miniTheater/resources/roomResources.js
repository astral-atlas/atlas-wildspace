// @flow strict
/*::
import type { GamePage, RoomPage } from "@astral-atlas/wildspace-models";
import type { MiniTheaterRenderResources } from "../useMiniTheaterResources";
*/

import { useMemo } from "@lukekaalim/act";
import {
  useMiniTheaterAssetResources,
} from "./assetResources";

export const useRoomPageMiniTheaterResources = (
  game/*: GamePage*/,
  room/*: RoomPage*/,
)/*: MiniTheaterRenderResources*/ => {
  const data = useMemo(() => {
    const assets = new Map([game.assets, room.assets].flat(1).map(a => [a.description.id, a]))
    const characters = new Map(game.characters.map(c => [c.id, c]));
    const monsterMasks = new Map(game.monsterMasks.map(m => [m.id, m]));
    const terrainProps = new Map(room.resources.terrainProps.map(t => [t.id, t]));
    const modelResources = new Map(room.resources.modelResources.map(m => [m.id, m]));

    return { assets, characters, monsterMasks, terrainProps, modelResources }
  }, [game.assets, game.characters, game.monsterMasks, game]);

  const assetResources = useMiniTheaterAssetResources(data);

  return useMemo(() => {
    return {
      ...data,
      ...assetResources,
    }
  }, [data, assetResources])
};