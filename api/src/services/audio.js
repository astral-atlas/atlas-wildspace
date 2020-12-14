// @flow strict
/*:: import type {
  HTTPAudioSourceID, HTTPAudioSource,
  BackgroundAudioTrackID, BackgroundAudioTrack,
  GameID, Game,
} from '@astral-atlas/wildspace-models'; */
/*:: import type { MemoryStore } from './store'; */
/*:: import type { GameService } from './game'; */

/*::
type TrackState = {
  trackId: BackgroundAudioTrackID | null,
  fromUnixTime: number,
  distanceSeconds: number,
};

type ActiveTrackListener = (track: TrackState) => mixed;
type AudioService = {
  activeTrack: {
    get: (game: Game) => Promise<TrackState>,
    set: (game: Game, track: TrackState) => Promise<void>,
  },
  getAudioInfo: (game: Game) => Promise<{
    tracks: BackgroundAudioTrack[],
    sources: HTTPAudioSource[],
  }>;

  onActiveTrackChange: (game: Game, listener: ActiveTrackListener) => () => void;
};
export type {
  TrackState,
  ActiveTrackListener,
  AudioService,
};
*/

const emptyTrackState = {
  trackId: null,
  fromUnixTime: 0,
  distanceSeconds: 0,
};

const createAudioService = (
  trackStore/*: MemoryStore<BackgroundAudioTrackID, BackgroundAudioTrack>*/,
  sourceStore/*: MemoryStore<HTTPAudioSourceID, HTTPAudioSource>*/,

  activeTracks/*: MemoryStore<GameID, TrackState>*/
)/*: AudioService*/ => {
  const getAudioInfo = async (game) => {
    const tracks =  [...trackStore.values]
      .map(([, track]) => track)
      .filter(track => track.gameId === game.gameId);
    const sourceIds = tracks.map(track => track.source);
    const sources = [...sourceStore.values]
      .map(([, source]) => source)
      .filter(source => sourceIds.includes(source.id))
    return {
      tracks,
      sources,
    };
  }
  const listenersByGame/*: Map<GameID, Set<ActiveTrackListener>>*/ = new Map();

  const setActiveTrack = async (game, trackState) => {
    await activeTracks.set(game.gameId, trackState);
    const listeners = listenersByGame.get(game.gameId) || [];
    for (const listener of listeners)
      listener(trackState);
  };
  const getActiveTrack = async (game) => {
    return (await activeTracks.get(game.gameId)) || emptyTrackState;
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
    activeTrack: {
      set: setActiveTrack,
      get: getActiveTrack,
    },
    getAudioInfo,
    onActiveTrackChange,
  };
};

module.exports = {
  createAudioService,
};
