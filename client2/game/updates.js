// @flow strict


/*::
import type { MiniTheaterEvent } from "../../models/game/miniTheater";
import type { HTTPServiceClient, WSServiceClient } from "../wildspace";
import type {
  GameID,
  MiniTheater, MiniTheaterID,
  LibraryEvent,
  UpdateChannelServerMessage,
  UpdateChannelClientMessage,
} from "@astral-atlas/wildspace-models";


import type { MiniTheaterClient } from "./miniTheater";
import type { MiniTheaterConnection } from "./updates/miniTheater";

import type { LibraryClient } from "./library";
import type { LibraryConnection } from "./updates/library";

import type { WikiDocClient } from "./wiki";
import type { WikiDocConnection } from "./updates/wikiDoc";
*/

import { gameAPI } from "@astral-atlas/wildspace-models";
import { createLibraryConnection } from "./updates/library";
import { createMiniTheaterConnection } from "./updates/miniTheater";
import { createWikiDocConnection } from "./updates/wikiDoc";

/*::
export type GameUpdatesConnection = {
  gameId: GameID,

  subscribe: (message: UpdateChannelServerMessage => mixed) => () => void,
  send: (message: UpdateChannelClientMessage) => void,

  close: () => void,
};
export type UpdatesConnection = {
  updates: GameUpdatesConnection,
  miniTheater: MiniTheaterConnection,
  wikiDoc: WikiDocConnection,
  library: LibraryConnection
};
export type GameUpdatesConnectionClient = {
  create: (gameId: GameID) => Promise<UpdatesConnection>,
};
*/

export const createGameUpdatesClient = (
  http/*: HTTPServiceClient*/,
  ws/*: WSServiceClient*/,
  wikiDocClient/*: WikiDocClient*/,
  libraryClient/*: LibraryClient*/,
  miniTheaterClient/*: MiniTheaterClient*/,
)/*: GameUpdatesConnectionClient*/ => {
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

    const updates = {
      gameId,
      send,

      close,
      subscribe,
    }

    return {
      updates,
      miniTheater: createMiniTheaterConnection(miniTheaterClient, updates),
      wikiDoc: createWikiDocConnection(wikiDocClient, updates),
      library: createLibraryConnection(libraryClient, updates)
    }
  };

  return { create }
}