// @flow strict
/*::
import type { MiniTheater, MiniTheaterID, MiniTheaterAction } from "@astral-atlas/wildspace-models";
import type { GameUpdatesConnection } from "../updates";
import type { MiniTheaterClient } from "../game/miniTheater";
import type { GameUpdateChannel } from "./meta";
*/
import { miniTheaterChannel, reduceMiniTheaterEvent } from "@astral-atlas/wildspace-models";
import { createUpdateChannel } from "./meta.js";

/*::
export type MiniTheaterConnection = {
  ...GameUpdateChannel<MiniTheaterID, MiniTheater>,
  act: (id: MiniTheaterID, action: MiniTheaterAction) => void,
};
*/

export const createMiniTheaterConnection = (
  miniTheaterClient/*: MiniTheaterClient*/,
  updates/*: GameUpdatesConnection*/
)/*: MiniTheaterConnection*/ => {
  const channel = createUpdateChannel(miniTheaterChannel, {
    createSubscribeEvent(id, miniTheaterIds) {
      return { type: 'mini-theater-subscribe', miniTheaterIds: [...miniTheaterIds] }
    },
    createUnsubscribeEvent(id, miniTheaterIds) {
      return { type: 'mini-theater-subscribe', miniTheaterIds: [...miniTheaterIds] }
    },
    getInitialResource(gameId, miniTheaterId) {
      return miniTheaterClient.readById(gameId, miniTheaterId);
    },
    getIds(message) {
      return [message.miniTheaterId];
    },
    reduceResourceEvent(miniTheater, { miniTheaterEvent }) {
      return reduceMiniTheaterEvent(miniTheater, miniTheaterEvent);
    },
    getChannelMessage(updateEvent) {
      switch (updateEvent.type) {
        case 'mini-theater-event':
          return updateEvent;
      }
    }
  }, updates);
  const act = (miniTheaterId, miniTheaterAction) => {
    updates.send({ type: 'mini-theater-action', miniTheaterId, miniTheaterAction })
  }

  return {
    ...channel,
    act,
  }
}