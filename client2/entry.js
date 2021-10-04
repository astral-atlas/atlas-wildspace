// @flow strict
/*:: import type { Connection } from '@lukekaalim/net-description'; */
/*:: import type { IdentityProof, UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { AudioPlaylistState, AudioPlaylistID, AudioPlaylist, GameID, AudioTrackID, AudioTrack } from '@astral-atlas/wildspace-models'; */

/*:: import type { AssetClient } from "./asset.js"; */
/*:: import type { AudioClient } from "./audio.js"; */

import { createJSONResourceClient, createWebClient } from "@lukekaalim/http-client";
import { createJSONConnectionClient } from "@lukekaalim/ws-client";
import { audioAPI } from '@astral-atlas/wildspace-models';
import { createAssetClient } from "./asset.js";
import { createAudioClient } from "./audio.js";


/*::
export type WildspaceClient = {
  asset: AssetClient,
  audio: AudioClient,
};
*/

const createTrackClient = (httpClient, baseURL) => {
  const tracksResourceClient = createJSONResourceClient(audioAPI["/tracks"], httpClient, `http://${baseURL}`);

  const get = async (gameId, trackId) => {
    const { body: { track }} = await tracksResourceClient.GET({ query: { gameId, trackId } });
    return track;
  };

  return {
    get,
  };
};

export const createWildspaceClient = (proof/*: IdentityProof*/, baseURL/*: string*/)/*: WildspaceClient*/ => {
  const httpClient = createWebClient(fetch);

  const playlistStateConnectionClient = createJSONConnectionClient(WebSocket, audioAPI["/playlist/state"].connection, `ws://${baseURL}`);
  const playlistStateResourceClient = createJSONResourceClient(audioAPI['/playlist/state'].resource, httpClient, `http://${baseURL}`);
  const playlistResourceClient = createJSONResourceClient(audioAPI['/playlist'], httpClient, `http://${baseURL}`);

  const connect = async (gameId, audioPlaylistId, onUpdate) => {
    const recieve = (message) => {
      switch (message.type) {
        case 'update':
          return onUpdate(message.state);
      }
    };
    const connection = await playlistStateConnectionClient.connect({ query: { audioPlaylistId, gameId }, recieve });
    connection.send({ type: 'identify', proof })

    return {
      close: connection.close,
    };
  };
  const update = async (gameId, audioPlaylistId, newState) => {
    await playlistStateResourceClient.PUT({ query: { audioPlaylistId, gameId }, body: { state: newState } });
  };
  const get = async (gameId, audioPlaylistId) => {
    const { body: { playlist } } = await playlistResourceClient.GET({ query: { gameId, audioPlaylistId } });
    return playlist;
  };

  const asset = createAssetClient(httpClient, baseURL);
  const audio = createAudioClient(httpClient, asset, baseURL);

  return {
    asset,
    audio,
  }
};