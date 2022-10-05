// @flow strict

import { pageAPI } from "@astral-atlas/wildspace-models";

/*::
import type { HTTPServiceClient, WSServiceClient } from "./wildspace";
import type { RoomPage, GamePage, GameID, RoomID } from "@astral-atlas/wildspace-models";

export type PageClient = {
  getGamePage: (gameId: GameID) => Promise<GamePage>,
  getRoomPage: (gameId: GameID, roomId: RoomID) => Promise<RoomPage>,
};
*/

export const createPageClient = (
  http/*: HTTPServiceClient*/,
  ws/*: WSServiceClient*/,
)/*: PageClient*/ => {
  const gamePageResource = http.createResource(pageAPI["/pages/game"]);
  const roomPageResource = http.createResource(pageAPI["/pages/room"]);

  const getGamePage = async (gameId) => {
    const { body: { gamePage } } = await gamePageResource.GET({ query: { gameId }})
    return gamePage;
  };
  const getRoomPage = async (gameId, roomId) => {
    const { body: { roomPage } } = await roomPageResource.GET({ query: { gameId, roomId }})
    return roomPage;
  };
  
  return {
    getGamePage,
    getRoomPage,
  }
}