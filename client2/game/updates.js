// @flow strict


/*::
import type { MiniTheaterEvent } from "../../models/game/miniTheater";
import type { HTTPServiceClient, WSServiceClient } from "../wildspace";
import type {
  GameID,
  MiniTheater, MiniTheaterID,
  LibraryEvent,
} from "@astral-atlas/wildspace-models";
*/

import { gameAPI } from "@astral-atlas/wildspace-models";

/*::
export type GameUpdatesConnection = {
  subscribeMiniTheater: (MiniTheaterID, MiniTheaterEvent => mixed) => () => void,
  subscribeLibrary: (LibraryEvent => mixed) => () => void,

  close: () => void,
};
export type GameUpdatesConnectionClient = {
  create: (gameId: GameID) => Promise<GameUpdatesConnection>,
};
*/

export const createGameUpdatesClient = (
  http/*: HTTPServiceClient*/,
  ws/*: WSServiceClient*/
)/*: GameUpdatesConnectionClient*/ => {
  const connection = ws.createAuthorizedConnection(gameAPI["/games/updates-advanced"]);

  const create = async (gameId) => {
    const publishKey = /*:: <T, K>*/(event/*: T*/, key/*: K*/, subscribers/*: Map<K, T => mixed>*/) => {
      for (const [id, subscriber] of subscribers) 
        if (id === key)
          subscriber(event);
    }
    const publish = /*:: <T>*/(event/*: T*/, subscribers/*: Set<T => mixed>*/) => {
      for (const subscriber of subscribers) 
        subscriber(event);
    }

    const miniTheaterSubscribers = new Map();
    const subscribeMiniTheater = (id, subscriber) => {
      miniTheaterSubscribers.set(id, subscriber)
      return () => {
        miniTheaterSubscribers.delete(subscriber)
      }
    };

    const librarySubscribers = new Set();
    const subscribeLibrary = (subscriber) => {
      librarySubscribers.add(subscriber)
      return () => {
        librarySubscribers.delete(subscriber)
      }
    };

    const recieve = (event) => {
      switch (event.type) {
        case 'mini-theater-event':
          return publishKey(event.miniTheaterEvent, event.miniTheaterId, miniTheaterSubscribers);
        case 'library-event':
          return publish(event.event, librarySubscribers);
      }
    }
  
    const updateConnection = await connection.connect({ query: { gameId }, recieve })

    const close = () => {
      updateConnection.close();
    }
  
    return {
      close,
      subscribeMiniTheater,
      subscribeLibrary,
    }
  };

  return { create }
}