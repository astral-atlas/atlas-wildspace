// @flow strict
/*:: import type { Connection } from '@lukekaalim/net-description'; */
/*:: import type { IdentityProof, UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { AudioPlaylistID, AudioPlaylist, GameID, AudioTrackID, AudioTrack } from '@astral-atlas/wildspace-models'; */

/*:: import type { AssetClient } from "./asset.js"; */
/*:: import type { AudioClient } from "./audio.js"; */
/*:: import type { RoomClient, RoomStateClient } from "./room"; */
/*:: import type { GameClient } from "./game"; */

import { createJSONResourceClient, createWebClient } from "@lukekaalim/http-client";
import { createJSONConnectionClient } from "@lukekaalim/ws-client";
import { audioAPI } from '@astral-atlas/wildspace-models';
import { createAssetClient } from "./asset.js";
import { createAudioClient } from "./audio.js";
import { createRoomClient, createRoomStateClient } from "./room.js";
import { createGameClient } from "./game.js";


/*::
export type WildspaceClient = {
  asset: AssetClient,
  audio: AudioClient,
  game: GameClient,
  room: {
    ...RoomClient,
    state: RoomStateClient,
  }
};
*/

export const createWildspaceClient = (proof/*: IdentityProof*/, baseURL/*: string*/)/*: WildspaceClient*/ => {
  const httpClient = createWebClient(fetch);

  const asset = createAssetClient(httpClient, baseURL);
  const audio = createAudioClient(httpClient, asset, baseURL);
  const room = {
    ...createRoomClient(httpClient, baseURL),
    state: createRoomStateClient(httpClient, baseURL)
  };
  const game = createGameClient(httpClient, baseURL);

  return {
    asset,
    game,
    audio,
    room,
  }
};