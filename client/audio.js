// @flow strict
/*:: import type { BackgroundAudioTrackID, BackgroundAudioTrack, GameID, HTTPAudioSource, ActiveTrackEvent } from '@astral-atlas/wildspace-models'; */
/*:: import type { RESTClient } from './rest'; */
/*:: import type { SocketClient, Connection } from './socket'; */

const { toBackgroundAudioTrack, toHTTPAudioSource, toBackgroundAudioTrackID, toActiveTrackEvent } = require('@astral-atlas/wildspace-models');
const { toObject, toArray } = require('@astral-atlas/wildspace-models/casting');

/*::
type AudioClient = {
  getAudioInfo: (gameId: GameID) => Promise<{
    tracks: BackgroundAudioTrack[],
    sources: HTTPAudioSource[],
  }>,
  connectActiveTrack: (gameId: GameID) => Promise<Connection<ActiveTrackEvent, ActiveTrackEvent>>
};
export type {
  AudioClient,
};
*/

const toAudioInfo = (v/*: mixed*/) => {
  const o = toObject(v);
  return {
    tracks: toArray(o.tracks).map(toBackgroundAudioTrack),
    sources: toArray(o.sources).map(toHTTPAudioSource)
  }
}

const createAudioClient = (rest/*: RESTClient*/, socketClient/*: SocketClient*/)/*: AudioClient*/ => {
  const getAudioInfo = async (gameId) => {
    const { content } = await rest.get({
      resource: '/game/tracks',
      params: { gameId }
    });
    const audioInfo = toAudioInfo(content);
    return audioInfo;
  };
  const connectActiveTrack = async (gameId) => {
    return await socketClient.connect('/game/tracks/active/events', { gameId }, toActiveTrackEvent, true);
  };
  return {
    connectActiveTrack,
    getAudioInfo,
  }
};

module.exports = {
  createAudioClient,
};
