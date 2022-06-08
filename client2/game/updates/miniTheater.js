// @flow strict
/*::
import type { MiniTheater, MiniTheaterID } from "@astral-atlas/wildspace-models";
import type { GameUpdatesConnection } from "../updates";
import type { MiniTheaterClient } from "../miniTheater";
*/

import { reduceMiniTheaterEvent } from "@astral-atlas/wildspace-models"

/*::
export type MiniTheaterConnectionClient = {
  upgrade: (updates: GameUpdatesConnection, miniTheaterId: MiniTheaterID) => Promise<MiniTheaterConnection>,
};
export type MiniTheaterConnection = {
  subscribe: (MiniTheater => mixed) => () => void,

  close: () => void,
};
*/

export const createMiniTheaterConnectionClient = (miniTheaterClient/*: MiniTheaterClient*/)/*: MiniTheaterConnectionClient*/ => {
  const upgrade = async (updates, miniTheaterId) => {
    let miniTheater/*: MiniTheater*/ = await miniTheaterClient.readById(updates.gameId, miniTheaterId)

    const subscribers = new Set();

    const onTheaterUpdate = (event) => {
      miniTheater = reduceMiniTheaterEvent(miniTheater, event);
      for (const subscriber of subscribers)
        subscriber(miniTheater);
    };

    const subscribe = (subscriber) => {
      subscribers.add(subscriber)
      subscriber(miniTheater);
      return () => {
        subscribers.delete(subscriber)
      };
    };

    const unsubscribe = await updates.subscribeMiniTheater(miniTheaterId, onTheaterUpdate)

    const close = () => {
      unsubscribe()
    };

    return { subscribe, close };
  };

  return { upgrade };
}