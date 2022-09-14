// @flow strict
/*::
import type { GameUpdatesConnection } from "../updates";
import type { GameUpdateChannel } from "./meta";
import type {
  GameID,
  RoomID, RoomPage
} from "@astral-atlas/wildspace-models";
import type { PageClient } from "../page";
*/

import { reduceRoomPageEvent, roomPageChannel } from "@astral-atlas/wildspace-models";
import { createUpdateChannel } from "./meta";

/*::
export type RoomPageConnection = GameUpdateChannel<RoomID, RoomPage>;
*/

export const createRoomPageConnection = (
  updates/*: GameUpdatesConnection*/,
  pageClient/*: PageClient*/,
)/*: RoomPageConnection*/ => {
  const channel = createUpdateChannel(roomPageChannel, {
    createSubscribeEvent(roomId, roomIds) {
      return { type: 'room-page-subscribe', roomIds: [...roomIds] };
    },
    createUnsubscribeEvent(roomId, roomIds) {
      return { type: 'room-page-subscribe', roomIds: [...roomIds] };
    },
    getChannelMessage(message) {
      switch (message.type) {
        case 'room-page-event':
          return message;
      }
    },
    getIds(message) {
      return [message.roomId];
    },
    async getInitialResource(gameId, roomId) {
      return await pageClient.getRoomPage(gameId, roomId);
    }
  }, updates);
  return channel; 
}