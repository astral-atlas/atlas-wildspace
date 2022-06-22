// @flow strict
/*::
import type { ServerUpdateChannel } from "./meta";
import type { ServerGameUpdateChannel } from "../update";
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { GameID, GameUpdate, MiniTheaterEvent, MiniTheaterID, MiniTheaterChannel } from "@astral-atlas/wildspace-models";
*/

import { createMiniTheaterEventFromAction, reduceMiniTheaterAction } from "@astral-atlas/wildspace-models";
import { v4 as uuid } from 'uuid';

/*::
export type MiniTheaterConnectionService = {
  create: (gameId: GameID, (MiniTheaterEvent, MiniTheaterID) => mixed) => ServerMiniTheaterChannel,
};  
export type ServerMiniTheaterChannel = ServerUpdateChannel<MiniTheaterChannel>;
*/

export const createServerMiniTheaterChannel = (data/*: WildspaceData*/, updates/*: ServerGameUpdateChannel*/)/*: ServerMiniTheaterChannel*/ => { 
  const subscriptions = new Set()

  const onMiniTheaterEvent = (miniTheaterId, miniTheaterEvent) => {
    updates.send({ type: 'mini-theater-event', miniTheaterId, miniTheaterEvent })
  }

  const close = async () => {
    for (const subscription of subscriptions)
      subscription.unsubscribe()
    subscriptions.clear();
  };
  const setSubscription = (ids) => {
    close();
    for (const id of ids) {
      const onEvent = (event) => {
        onMiniTheaterEvent(id, event)
      }
      subscriptions.add(data.gameData.miniTheaterEvents.subscribe(id, onEvent));
    }
  }
  const onMiniTheaterAction = async (id, action) => {
    const { next } = await data.gameData.miniTheaters.transaction(updates.game.id, id, prev => ({
      ...reduceMiniTheaterAction(prev, action),
      version: uuid(),
    }));
    data.gameData.miniTheaterEvents.publish(id, createMiniTheaterEventFromAction(action, next))
  }
  const update = (event) => {
    switch (event.type) {
      case 'mini-theater-action':
        return void onMiniTheaterAction(event.miniTheaterId, event.miniTheaterAction);
      case 'mini-theater-subscribe':
        return void setSubscription(event.miniTheaterIds);
    }
  }

  return { close, update };
}