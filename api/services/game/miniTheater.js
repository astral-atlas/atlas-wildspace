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
  const applyAction = async (gameId, miniTheaterId, action, isGM) => {
    const { next } = await data.gameData.miniTheaters.transaction(gameId, miniTheaterId, prev => {
      if (isPermissableAction(action, prev) && !isGM)
        return prev;

      return {
        ...reduceMiniTheaterAction(action, prev),
        version: v4(),
      }
    });
    data.gameData.miniTheaterEvents.publish(miniTheaterId, { type: 'update-pieces', pieces: next.pieces, version: next.version })
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