// @flow strict
/*:: import type { BackgroundAudioTrackID, BackgroundAudioTrack, GameID, ActiveTrackEvent } from '@astral-atlas/wildspace-models'; */
/*:: import type { RESTClient } from './rest'; */
/*:: import type { SocketClient, Connection } from './socket'; */

const { toBackgroundAudioTrack, toBackgroundAudioTrackID, toActiveTrackEvent } = require('@astral-atlas/wildspace-models');
const { getGameAudioEndpoint } = require('@astral-atlas/wildspace-models');
const { toObject, toArray } = require('@astral-atlas/wildspace-models/casting');
const { createEndpointClient } = require('./endpoint');

/*::
type AudioClient = {
  getAudioInfo: (gameId: GameID) => Promise<{
    tracks: BackgroundAudioTrack[],
  }>,
  connectActiveTrack: (gameId: GameID) => Promise<Connection<ActiveTrackEvent, ActiveTrackEvent>>
};
export type {
  AudioClient,
};
*/

const createAudioClient = (rest/*: RESTClient*/, socketClient/*: SocketClient*/)/*: AudioClient*/ => {
  const getGameAudio = createEndpointClient(rest, getGameAudioEndpoint);

  const getAudioInfo = async (gameId) => {
    return  await getGameAudio.request({ gameId }, null);
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
