// @flow strict
/*:: import type { Connection, Resource, ResourceDescription, ConnectionDescription } from '@lukekaalim/net-description'; */
/*:: import type { ResourceClient, HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { ClientConnection } from '@lukekaalim/ws-client'; */
/*:: import type { IdentityProof, UserID, LinkProof } from '@astral-atlas/sesame-models'; */
/*:: import type { AudioPlaylistID, AudioPlaylist, GameID, AudioTrackID, AudioTrack, AuthorizedConnection } from '@astral-atlas/wildspace-models'; */

/*:: import type { AssetClient } from "./asset.js"; */
/*:: import type { AudioClient } from "./audio.js"; */
/*:: import type { RoomClient } from "./room"; */
/*:: import type { GameClient } from "./game"; */

import { createAuthorizedClient, createJSONResourceClient, createWebClient } from "@lukekaalim/http-client";
import { createJSONConnectionClient } from "@lukekaalim/ws-client";
import { audioAPI, selfAPI } from '@astral-atlas/wildspace-models';
import { createAssetClient } from "./asset.js";
import { createAudioClient } from "./audio.js";
import { createRoomClient } from "./room.js";
import { createGameClient } from "./game.js";
import { encodeProofToken } from "@astral-atlas/sesame-models";


/*::
export type HTTPServiceClient = {
  createResource: <T: Resource>(desc: ResourceDescription<T>) => ResourceClient<T>,
  httpOrigin: string,
  httpClient: HTTPClient,
};
export type WSServiceClient = {
  createConnection: <T: Connection<>>(desc: ConnectionDescription<T>) => ClientConnection<T>,
  createAuthorizedConnection: <T: Connection<any>>(desc: ConnectionDescription<AuthorizedConnection<T>>) => ClientConnection<T>,
}
*/

export const createHTTPServiceJSONClient = (httpOrigin/*: string*/, httpClient/*: HTTPClient*/, proof/*: ?LinkProof*/)/*: HTTPServiceClient*/ => {
  const token = proof ? encodeProofToken(proof) : null;
  const authorizedClient = createAuthorizedClient(httpClient, token ? { type: 'bearer', token } : null)
  const createResource = /*:: <T: Resource>*/(desc/*: ResourceDescription<T>*/)/*: ResourceClient<T>*/ => {
    return createJSONResourceClient(desc, authorizedClient, httpOrigin);
  };
  return { createResource, httpClient: authorizedClient, httpOrigin };
}
export const createWSServiceJSONClient  = (
  wsOrigin/*: string*/,
  websocket/*: Class<WebSocket>*/,
  proof/*: ?LinkProof*/
)/*: WSServiceClient*/ => {

  const createConnection = /*:: <T: Connection<>>*/(
    desc/*: ConnectionDescription<T>*/
  )/*: ClientConnection<T>*/ => {
    return createJSONConnectionClient(websocket, desc, wsOrigin);
  };

  const createAuthorizedConnection =  /*:: <T: Connection<any>>*/(
    desc/*: ConnectionDescription<AuthorizedConnection<T>>*/
  )/*: ClientConnection<T>*/ => {
    const connection = createJSONConnectionClient(websocket, desc, wsOrigin);
    const connect = async (options) => {
      const c = await connection.connect(options);
      c.socket.addEventListener('error', console.log);
      if (proof)
        c.send({ type: 'proof', proof });
      return c;
    };
    return { connect }
  }
  return { createConnection, createAuthorizedConnection };
}

/*::
export type WildspaceClient = {
  asset: AssetClient,
  audio: AudioClient,
  game: GameClient,
  room: RoomClient,
  self: () => Promise<{ name: string }>,
};
*/

export const createWildspaceClient = (proof/*: ?LinkProof*/, httpOrigin/*: string*/, wsOrigin/*: string*/)/*: WildspaceClient*/ => {
  const token = proof ? encodeProofToken(proof) : null;
  const httpClient = createWebClient(fetch);
  const authorizedClient = createAuthorizedClient(httpClient, token ? { type: 'bearer', token } : null)

  const httpService = createHTTPServiceJSONClient(httpOrigin, httpClient, proof);
  const wsService = createWSServiceJSONClient(wsOrigin, WebSocket, proof);

  const asset = createAssetClient(httpService, httpClient);
  const audio = createAudioClient(authorizedClient, asset, httpOrigin, wsOrigin);
  const room = createRoomClient(httpService, wsService);
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