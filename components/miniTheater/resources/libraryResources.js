// @flow strict

import { createMaskForMonsterActor } from "@astral-atlas/wildspace-models";
import { useMemo } from "@lukekaalim/act";
import {
  useMiniTheaterAssetResources,
} from "./assetResources";

/*::
import type { MiniTheaterRenderResources } from "../useMiniTheaterResources";
import type { LibraryData } from "@astral-atlas/wildspace-models";
*/

export const useLibraryMiniTheaterResources = (
  library/*: LibraryData*/,
)/*: MiniTheaterRenderResources*/ => {
  const data = useMemo(() => {
    const assets = new Map(library.assets.map(a => [a.description.id, a]))
    const characters = new Map(library.characters.map(c => [c.id, c]));
    const monsterMasks = new Map(library.monsterActors.map(actor => {
      const monster = library.monsters.find(m => m.id === actor.monsterId);
      if (!monster)
        return null;
      return [actor.id, createMaskForMonsterActor(monster, actor)]
    }).filter(Boolean));
    const modelResources = new Map(library.modelResources.map(m => [m.id, m]));
    const terrainProps = new Map(library.terrainProps
      .filter(t => modelResources.has(t.modelResourceId))
      .map(t => [t.id, t]));

    return { assets, characters, monsterMasks, terrainProps, modelResources }
  }, [
    library.assets, library.characters,
    library.monsterActors, library.monsters,
    library.terrainProps, library.modelResources
  ]);
  
  const assetResources = useMiniTheaterAssetResources(data);

  return useMemo(() => {
    return {
      ...data,
      ...assetResources,
    }
  }, [data, assetResources])
}