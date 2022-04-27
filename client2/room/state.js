// @flow strict

import { roomAPI } from "@astral-atlas/wildspace-models"

/*::
import type { RoomState, GameID, RoomID, RoomStateEvent } from "@astral-atlas/wildspace-models";

import type { HTTPServiceClient, WSServiceClient } from '../wildspace.js';

export type RoomStateClient = {
  get: (gameId: GameID, roomId: RoomID) => Promise<RoomState>,
  connect: (gameId: GameID, roomId: RoomID, recieve: RoomStateEvent => void) => Promise<{ close: () => Promise<void> }>
};
*/

export const createRoomStateClient = (http/*: HTTPServiceClient*/, ws/*: WSServiceClient*/)/*: RoomStateClient*/ => {
  const roomStateResource = http.createResource(roomAPI["/room/state/v2"].resource);
  const roomStateConnection = ws.createAuthorizedConnection(roomAPI["/room/state/v2"].connection);

  const get = async (gameId, roomId) => {
    const response = await roomStateResource.GET({ query: { gameId, roomId } });
    
    return response.body.state;
  };

  const connect = async (gameId, roomId, recieve) => {

    const connection = await roomStateConnection.connect({ query: { gameId, roomId }, recieve: (event) => {
      if (event.type === 'heartbeat')
        return;
      recieve(event)
    } })

    return {
      close: connection.close
    };
  }


  return {
    get,
    connect,
  };
}