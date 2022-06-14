// @flow strict
/*::
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { GameID, RoomPageChannel } from "@astral-atlas/wildspace-models";
import type { ServerUpdateChannel } from "./meta";
import type { ServerGameUpdateChannel } from "../update";
import type { RoomService } from "../room";
*/

/*::
export type ServerRoomPageChannel = ServerUpdateChannel<RoomPageChannel>;
*/

export const createServerRoomPageChannel = (
  data/*: WildspaceData*/,
  roomService/*: RoomService*/,
  { gameId, send }/*: ServerGameUpdateChannel*/
)/*: ServerRoomPageChannel*/ => {
  const onGameUpdate = (roomId) => async (gameUpdateEvent) => {
    const page = await roomService.getRoomPage(gameId, roomId);
    if (!page)
      return;
    const event = { type: 'next-page', page };
    send({ type: 'room-page-event', roomId, event })
  }

  const subscriptions = new Map();
  const onSubscribe = (roomIds) => {
    close();
    for (const roomId of roomIds) {
      const gameUpdateSubscription = data.gameUpdates.subscribe(gameId, onGameUpdate(roomId))

      subscriptions.set(roomId, () => {
        gameUpdateSubscription.unsubscribe();
      })
    }
  };

  const update = (message) => {
    switch (message.type) {
      case "room-page-subscribe":
        return void onSubscribe(message.roomIds);
    }
  };

  const close = async () => {
    for (const subscription of subscriptions)
      return;
  }
  return { close, update }
}