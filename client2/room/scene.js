// @flow strict
import { roomAPI } from "@astral-atlas/wildspace-models"


/*::
import type { RoomState, GameID, RoomID, SceneRef } from "@astral-atlas/wildspace-models";

import type { HTTPServiceClient, WSServiceClient } from '../wildspace.js';
import type { LobbyMessageContent } from "../../models/room/lobby";

export type RoomSceneClient = {
  setActiveScene: (gameId: GameID, roomId: RoomID, activeScene: SceneRef) => Promise<void>,
}
*/

export const createRoomSceneClient = (http/*: HTTPServiceClient*/)/*: RoomSceneClient*/ => {
  const sceneRefResource = http.createResource(roomAPI["/room/scene/ref"])

  const setActiveScene = async (gameId, roomId, activeScene) => {
    await sceneRefResource.POST({ query: { gameId, roomId }, body: { activeScene } })
  }
  
  return {
    setActiveScene,
  }
};
