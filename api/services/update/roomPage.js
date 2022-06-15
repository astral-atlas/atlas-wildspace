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
  const onRoomUpdate = (roomId) => async (roomUpdate) => {
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
      const gameUpdateSubscription = data.gameUpdates.subscribe(gameId, onGameUpdate(roomId));
      const roomUpdateSubscription = data.roomUpdates.subscribe(roomId, onRoomUpdate(roomId));
      const roomDataUpdateSubscription = data.roomData.updates.subscribe(roomId, onRoomUpdate(roomId));

      subscriptions.set(roomId, () => {
        gameUpdateSubscription.unsubscribe();
        roomUpdateSubscription.unsubscribe();
        roomDataUpdateSubscription.unsubscribe();
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
    for (const [,unsubscribe] of subscriptions)
      unsubscribe()
    return;
  }
  return { close, update }
}