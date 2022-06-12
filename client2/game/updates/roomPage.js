// @flow strict
/*::
import type { RoomClient } from "../../room.js";
import type { GameUpdatesConnection } from "../updates";
import type { GameUpdateChannel } from "./meta";
import type {
  GameID,
  RoomID, RoomPage
} from "@astral-atlas/wildspace-models";
*/

import { reduceRoomPageEvent, roomPageChannel } from "@astral-atlas/wildspace-models";
import { createUpdateChannel } from "./meta";

/*::
export type RoomPageConnection = GameUpdateChannel<RoomID, RoomPage>;
*/

export const createRoomPageConnection = (
  room/*: RoomClient*/,
  updates/*: GameUpdatesConnection*/,
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
      return await room.getRoomPage(gameId, roomId);
    }
  }, updates);
  return channel; 
}