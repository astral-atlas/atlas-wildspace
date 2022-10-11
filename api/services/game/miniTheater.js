// @flow strict
/*::
import type { WildspaceData } from '@astral-atlas/wildspace-data';
import type { GameID, MiniTheater, MiniTheaterID, MiniTheaterAction, MiniTheaterEvent } from '@astral-atlas/wildspace-models';
*/
import { v4 } from "uuid";
/*::
export type MiniTheaterService = {
  applyAction: (
    gameId: GameID,
    miniTheaterId: MiniTheaterID,
    action: MiniTheaterAction,
    isGM: boolean
  ) => Promise<MiniTheater>,
  subscribeEvents: (
    miniTheaterId: MiniTheaterID,
    subscriber: MiniTheaterEvent => mixed
  ) => { unsubscribe: () => void }
};
*/

import { isPermissableAction, reduceMiniTheaterAction } from "@astral-atlas/wildspace-models";

export const createMiniTheaterService = (
  data/*: WildspaceData*/
)/*: MiniTheaterService*/ => {
  const getEventForAction = (action, miniTheater) => {
    switch (action.type) {
      case 'set-layers':
      case 'set-terrain':
        return { type: 'update', next: miniTheater }
      default:
        return { type: 'update-pieces', pieces: miniTheater.pieces, version: miniTheater.version };
    }
  }

  const applyAction = async (gameId, miniTheaterId, action, isGM) => {
    const { next } = await data.gameData.miniTheaters.transaction(gameId, miniTheaterId, prev => {
      if (!isPermissableAction(action, prev) && !isGM)
        return prev;

      return {
        ...reduceMiniTheaterAction(action, prev),
        version: v4(),
      }
    }, 5);
    const event = getEventForAction(action, next);
    data.gameData.miniTheaterEvents.publish(miniTheaterId, event)

    return next;
  };
  const subscribeEvents = (miniTheaterId, subscriber) => {
    return data.gameData.miniTheaterEvents.subscribe(miniTheaterId, subscriber);
  }

  return {
    applyAction,
    subscribeEvents,
  }
};