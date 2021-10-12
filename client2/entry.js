// @flow strict
/*:: import type { Connection, Resource, ResourceDescription, ConnectionDescription } from '@lukekaalim/net-description'; */
/*:: import type { ResourceClient, HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { ClientConnection } from '@lukekaalim/ws-client'; */
/*:: import type { IdentityProof, UserID, LinkProof } from '@astral-atlas/sesame-models'; */
/*:: import type { AudioPlaylistID, AudioPlaylist, GameID, AudioTrackID, AudioTrack } from '@astral-atlas/wildspace-models'; */

/*:: import type { AssetClient } from "./asset.js"; */
/*:: import type { AudioClient } from "./audio.js"; */
/*:: import type { RoomClient, RoomStateClient } from "./room"; */
/*:: import type { GameClient } from "./game"; */

import { createAuthorizedClient, createJSONResourceClient, createWebClient } from "@lukekaalim/http-client";
import { createJSONConnectionClient } from "@lukekaalim/ws-client";
import { audioAPI, selfAPI } from '@astral-atlas/wildspace-models';
import { createAssetClient } from "./asset.js";
import { createAudioClient } from "./audio.js";
import { createRoomClient, createRoomStateClient } from "./room.js";
import { createGameClient } from "./game.js";
import { encodeProofToken } from "@astral-atlas/sesame-models";


/*::
export type HTTPServiceClient = {
  createResource: <T: Resource>(desc: ResourceDescription<T>) => ResourceClient<T>
};
export type WSServiceClient = {
  createConnection: <T: Connection<>>(desc: ConnectionDescription<T>) => ClientConnection<T>
}
*/

export const createHTTPServiceJSONClient = (httpOrigin/*: string*/, httpClient/*: HTTPClient*/)/*: HTTPServiceClient*/ => {
  const createResource = /*:: <T>*/(desc) => {
    return createJSONResourceClient(desc, httpClient, httpOrigin);
  };
  return { createResource };
}
export const createWSServiceJSONClient  = (wsOrigin/*: string*/, websocket/*: Class<WebSocket>*/)/*: WSServiceClient*/ => {
  const createConnection = /*:: <T>*/(desc) => {
    return createJSONConnectionClient(websocket, desc, wsOrigin);
  };
  return { createConnection };

}

/*::
export type WildspaceClient = {
  asset: AssetClient,
  audio: AudioClient,
  game: GameClient,
  room: {
    ...RoomClient,
    state: RoomStateClient,
  },
  self: () => Promise<{ name: string }>,
};
*/

export const createWildspaceClient = (proof/*: ?LinkProof*/, httpOrigin/*: string*/, wsOrigin/*: string*/)/*: WildspaceClient*/ => {
  const token = proof ? encodeProofToken(proof) : null;
  const httpClient = createWebClient(fetch);
  const authorizedClient = createAuthorizedClient(httpClient, token ? { type: 'bearer', token } : null)

  const httpService = createHTTPServiceJSONClient(httpOrigin, authorizedClient);
  const wsService = createWSServiceJSONClient(wsOrigin, WebSocket);

  const asset = createAssetClient(authorizedClient, httpOrigin, wsOrigin);
  const audio = createAudioClient(authorizedClient, asset, httpOrigin, wsOrigin);
  const room = {
    ...createRoomClient(authorizedClient, httpOrigin, wsOrigin),
    state: createRoomStateClient(authorizedClient, httpOrigin, wsOrigin)
  };
  const game = createGameClient(httpService, wsService);

  const selfResource = httpService.createResource(selfAPI['/self']);
  const self = async () => {
    const { body: { name }} = await selfResource.GET();
    return { name };
  };

  return {
    asset,
    game,
    audio,
    room,
    self,
  }
};