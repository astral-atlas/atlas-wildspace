// @flow strict
/*::
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { AssetService } from "../asset";
import type { GameID, LibraryData } from "@astral-atlas/wildspace-models";

export type LibraryPageService = {
  getLibraryData(gameId: GameID): Promise<LibraryData>
};
*/

export const createLibraryPageService = (
  data/*: WildspaceData*/,
  asset/*: AssetService*/,
)/*: LibraryPageService*/ => {
  const getLibraryData = async (gameId) => {

    const [
      { result: rooms },
      { result: characters },
      { result: monsters },
      { result: monsterActors },
      { result: miniTheaters },
      { result: scenes },
      { result: locations },
      { result: tracks },
      { result: playlists },
      { results: terrainProps },
      { results: modelResources },
    ] = await Promise.all([
      data.room.query(gameId),
      data.characters.query(gameId),
      data.monsters.query(gameId),
      data.gameData.monsterActors.query(gameId),
      data.gameData.miniTheaters.query(gameId),
      data.gameData.scenes.query(gameId),
      data.gameData.locations.query(gameId),
      data.tracks.query(gameId),
      data.playlists.query(gameId),
      data.gameData.miniTheater.terrainProps.query(gameId),
      data.gameData.resources.models.query(gameId),
    ])
    const assets = await asset.batchPeek([
      ...characters.map(c => c.initiativeIconAssetId),
      ...monsters.map(m => m.initiativeIconAssetId),
      ...tracks.map(t => [t.trackAudioAssetId, t.coverImageAssetId]).flat(1),
      ...locations.map(l => l.background.type === 'image' && l.background.imageAssetId || null),
      ...modelResources.map(m => m.result.assetId)
    ])
    const libraryData = {
      rooms,
      modelResources: modelResources.map(r => r.result),
      characters,
      monsters,
      monsterActors,
      miniTheaters,
      terrainProps: terrainProps.map(r => r.result),
      scenes,
      locations,
      tracks,
      playlists,
      assets,
    };
    return libraryData;
  };

  return {
    getLibraryData,
  }
}