// @flow strict
import { roomAPI } from "@astral-atlas/wildspace-models"


/*::
import type { RoomState, GameID, RoomID, RoomStateEvent } from "@astral-atlas/wildspace-models";

import type { HTTPServiceClient, WSServiceClient } from '../wildspace.js';
import type { LobbyMessageContent } from "../../models/room/lobby";

export type LobbyClient = {
  postMessage: (gameId: GameID, roomId: RoomID, content: LobbyMessageContent) => Promise<void>,
}
*/

export const createLobbyClient = (http/*: HTTPServiceClient*/)/*: LobbyClient*/ => {
  const messageResource = http.createResource(roomAPI["/room/lobby/message"])

  const postMessage = async (gameId, roomId, content) => {
    await messageResource.POST({ query: { gameId, roomId }, body: { content } })
  }
  
  return {
    postMessage,
  }
};
