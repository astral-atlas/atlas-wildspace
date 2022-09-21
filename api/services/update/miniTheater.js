// @flow strict
/*::
import type { ServerUpdateChannel } from "./meta";
import type { ServerGameUpdateChannel } from "../update";
import type { GameService } from "../game";
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { GameID, GameUpdate, MiniTheaterAction, MiniTheaterID, MiniTheaterChannel } from "@astral-atlas/wildspace-models";
*/

import { reduceMiniTheaterAction } from '@astral-atlas/wildspace-models';
import { v4 as uuid } from 'uuid';

/*::
export type MiniTheaterConnectionService = {
  create: (gameId: GameID, (MiniTheaterAction, MiniTheaterID) => mixed) => ServerMiniTheaterChannel,
};  
export type ServerMiniTheaterChannel = ServerUpdateChannel<MiniTheaterChannel>;
*/

export const createServerMiniTheaterChannel = (
  data/*: WildspaceData*/,
  gameService/*: GameService*/,
  updates/*: ServerGameUpdateChannel*/
)/*: ServerMiniTheaterChannel*/ => { 
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
      subscriptions.add(gameService.miniTheater.subscribeEvents(id, onEvent));
    }
  }
  const onMiniTheaterAction = async (id, action) => {
    const { game, userId } = updates;
    const isGM = game.gameMasterId === userId;
    await gameService.miniTheater.applyAction(updates.game.id, id, action, isGM);
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