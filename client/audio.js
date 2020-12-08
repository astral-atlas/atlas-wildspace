// @flow strict
/*:: import type { BackgroundAudioTrackID, BackgroundAudioTrack, GameID, HTTPAudioSource, ActiveTrackEvent } from '@astral-atlas/wildspace-models'; */
/*:: import type { RESTClient } from './rest'; */
/*:: import type { SocketClient } from './socket'; */

const { toBackgroundAudioTrack, toHTTPAudioSource, toBackgroundAudioTrackID, toActiveTrackEvent } = require('@astral-atlas/wildspace-models');
const { toObject, toArray } = require('@astral-atlas/wildspace-models/casting');

/*::
type AudioClient = {
  getAudioInfo: (gameId: GameID) => Promise<{
    tracks: BackgroundAudioTrack[],
    sources: HTTPAudioSource[],
  }>,
  connectActiveTrack: (gameId: GameID, onChange: (event: ActiveTrackEvent) => mixed) => Promise<{
    set: (trackId: string | null, distanceSeconds: number, fromUnixTime: number) => void,
    close: () => void,
  }>
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
  const connectActiveTrack = async (gameId, onChange) => {
    const connection = await socketClient.connect/*:: <ActiveTrackEvent, ActiveTrackEvent>*/(
      '/game/tracks/active/events',
      { gameId },
      onChange,
      toActiveTrackEvent
    );
    const set = (trackId, distanceSeconds, fromUnixTime) => {
      connection.send({
        type: 'update',
        trackId,
        distanceSeconds,
        fromUnixTime,
      });
    };
    const close = (status = 1000, reason) => connection.socket.close(status, reason)
    return {
      set,
      close,
    };
  };
  return {
    connectActiveTrack,
    getAudioInfo,
  }
};

module.exports = {
  createAudioClient,
};
