// @flow strict


/*::
import type { HTTPServiceClient, WSServiceClient } from "./wildspace";
import type {
  GameID,
  MiniTheater, MiniTheaterID, MiniTheaterEvent,
  LibraryEvent,
  UpdateChannelServerMessage,
  UpdateChannelClientMessage,
} from "@astral-atlas/wildspace-models";

import type { RoomClient } from "./room";
import type { GameClient } from "./game";

import type { MiniTheaterConnection } from "./updates/miniTheater";
import type { LibraryConnection } from "./updates/library";
import type { WikiDocConnection } from "./updates/wikiDoc";
import type { RoomPageConnection } from "./updates/roomPage";
import type { GamePageConnection } from "./updates/gamePage";
*/

import { gameAPI } from "@astral-atlas/wildspace-models";
import { createLibraryConnection } from "./updates/library";
import { createMiniTheaterConnection } from "./updates/miniTheater";
import { createWikiDocConnection } from "./updates/wikiDoc";
import { createRoomPageConnection } from "./updates/roomPage";
import { createGamePageConnection } from "./updates/gamePage";

/*::
export type GameUpdatesConnection = {
  socket: WebSocket,
  gameId: GameID,

  subscribe: (message: UpdateChannelServerMessage => mixed) => () => void,
  send: (message: UpdateChannelClientMessage) => void,

  close: () => void,
};
export type UpdatesConnection = {
  updates: GameUpdatesConnection,
  miniTheater: MiniTheaterConnection,
  wikiDoc: WikiDocConnection,
  library: LibraryConnection,
  roomPage: RoomPageConnection,
  gamePage: GamePageConnection
};
export type UpdatesConnectionClient = {
  create: (gameId: GameID) => Promise<UpdatesConnection>,
};
*/

export const createUpdatesClient = (
  http/*: HTTPServiceClient*/,
  ws/*: WSServiceClient*/,
  gameClient/*: GameClient*/,
  roomClient/*: RoomClient*/,
)/*: UpdatesConnectionClient*/ => {
  const connection = ws.createAuthorizedConnection(gameAPI["/games/updates-advanced"]);

  const create = async (gameId) => {
    const subscribers = new Set();
    const subscribe = (subscriber) => {
      subscribers.add(subscriber)
      return () => void subscribers.delete(subscriber);
    }

    const recieve = (event) => {
      for (const subscriber of subscribers)
        subscriber(event);
    }
  
    const updateConnection = await connection.connect({ query: { gameId }, recieve })

    const close = () => {
      updateConnection.close();
    }
    const send = (message) => {
      updateConnection.send(message);
    }
    const socket = updateConnection.socket;

    const updates = {
      socket,

      gameId,
      send,

      close,
      subscribe,
    }

    return {
      updates,
      miniTheater: createMiniTheaterConnection(gameClient.miniTheater, updates),
      wikiDoc: createWikiDocConnection(gameClient.wiki, updates),
      library: createLibraryConnection(gameClient.library, updates),
      roomPage: createRoomPageConnection(roomClient, updates),
      gamePage: createGamePageConnection(gameClient, updates),
    }
  };

  return { create }
}