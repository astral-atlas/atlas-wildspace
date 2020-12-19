// @flow strict
/*:: import type {
  AudioAssetID, AudioAsset,
  ActiveTrackRow,
  BackgroundAudioTrackID, BackgroundAudioTrack,
  GameID, Game,
} from '@astral-atlas/wildspace-models'; */
/*:: import type { Tables } from '../tables'; */
/*:: import type { GameService } from './game'; */
/*:: import type { AssetServices } from './asset'; */

/*::
type ActiveTrackListener = (track: ActiveTrackRow) => mixed;
type AudioService = {
  getActiveTrack: (game: Game) => Promise<ActiveTrackRow>,
  setActiveTrack: (game: Game, track: ActiveTrackRow) => Promise<void>,
  getGameAudio: (game: Game) => Promise<{
    tracks: BackgroundAudioTrack[],
  }>;

  onActiveTrackChange: (game: Game, listener: ActiveTrackListener) => () => void;
};
export type {
  ActiveTrackListener,
  AudioService,
};
*/

const defaultActiveTrackRow = {
  trackId: null,
  fromUnixTime: 0,
  distanceSeconds: 0,
};

const createAudioService = (
  tables/*: Tables*/,
  gameService/*: GameService*/,
  assetServices/*: AssetServices*/
)/*: AudioService*/ => {
  const listenersByGame/*: Map<GameID, Set<ActiveTrackListener>>*/ = new Map();

  const getGameAudio = async (game) => {
    const trackRows = await tables.audio.backgroundTracks.select({ gameId: game.gameId });
    console.log(trackRows);
    const tracks = await Promise.all(trackRows.map(async trackRow => ({
      id: trackRow.id,
      name: trackRow.name,
      gameId: trackRow.gameId,
      asset: await assetServices.database.getAudioAsset(trackRow.audioAssetId),
    })));

    return {
      tracks,
    };
  }

  const setActiveTrack = async ({ gameId }, newActiveTrackRow) => {
    if ((await tables.audio.activeTracks.select({ gameId })).length === 0) {
      await tables.audio.activeTracks.insert([
        { ...newActiveTrackRow, gameId },
      ]);
    } else {
      await tables.audio.activeTracks.update(
        { gameId },
        { ...newActiveTrackRow, gameId },
      );
    }
    const listeners = listenersByGame.get(gameId) || [];
    for (const listener of listeners)
      listener(newActiveTrackRow);
  };
  const getActiveTrack = async (game) => {
    const [activeTrackState] = await tables.audio.activeTracks.select({ gameId: game.gameId });
    return activeTrackState || { ...defaultActiveTrackRow, gameId: game.gameId };
  };
  const onActiveTrackChange = (game, listener) => {
    const listeners = listenersByGame.get(game.gameId) || new Set();
    listeners.add(listener);
    listenersByGame.set(game.gameId, listeners);
    return () => {
      listeners.delete(listener);
    }
  };

  return {
    getGameAudio,
    getActiveTrack,
    setActiveTrack,
    onActiveTrackChange,
  };
};

module.exports = {
  createAudioService,
};
