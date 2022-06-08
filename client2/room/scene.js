// @flow strict
import { roomAPI } from "@astral-atlas/wildspace-models"


/*::
import type { RoomState, GameID, RoomID, SceneID } from "@astral-atlas/wildspace-models";

import type { HTTPServiceClient, WSServiceClient } from '../wildspace.js';
import type { LobbyMessageContent } from "../../models/room/lobby";
import type { RoomSceneState } from "../../models/room/scene";

export type RoomSceneClient = {
  set: (gameId: GameID, roomId: RoomID, nextState: RoomSceneState) => Promise<void>,
  get: (gameId: GameID, roomId: RoomID) => Promise<RoomSceneState>,
}
*/

export const createRoomSceneClient = (http/*: HTTPServiceClient*/)/*: RoomSceneClient*/ => {
  const sceneResource = http.createResource(roomAPI["/games/rooms/scene"])

  const set = async (gameId, roomId, nextState) => {
    await sceneResource.PUT({ query: { gameId, roomId }, body: { state: nextState } })
  }
  const get = async (gameId, roomId) => {
    const { body: { state }} = await sceneResource.GET({ query: { gameId, roomId }});
    return state;
  }
  
  return {
    get,
    set,
  }
};
