// @flow strict
/*::
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { GameID, RoomPageChannel } from "@astral-atlas/wildspace-models";
import type { ServerUpdateChannel } from "./meta";
import type { ServerGameUpdateChannel } from "../update";
import type { RoomService } from "../room";
import type { GameService } from "../game";
import type { PageService } from "../page";
*/
import { v4 as uuid } from 'uuid';

/*::
export type ServerRoomPageChannel = ServerUpdateChannel<RoomPageChannel>;
*/

export const createServerRoomPageChannel = (
  data/*: WildspaceData*/,
  gameService/*: GameService*/,
  roomService/*: RoomService*/,
  pageService/*: PageService*/,
  { game, send, connectionId, userId }/*: ServerGameUpdateChannel*/
)/*: ServerRoomPageChannel*/ => {
  const onConnectionUpdate = (roomId) => async (update) => {
    const connections = update.connections
      .filter(c => c.roomId === roomId)
      .map(c => ({ id: c.gameConnectionId, userId: c.userId }))
    const event = { type: 'connection-update', connections };
    send({ type: 'room-page-event', roomId, event });
  };
  const onGameUpdate = (roomId) => async (gameUpdateEvent) => {
    const page = await pageService.getRoomPage(game.id, roomId);
    if (!page)
      return;
    const event = { type: 'next-page', page };
    send({ type: 'room-page-event', roomId, event })
  }
  const onRoomUpdate = (roomId) => async (roomUpdate) => {
    const page = await pageService.getRoomPage(game.id, roomId);
    if (!page)
      return;
    const event = { type: 'next-page', page };
    send({ type: 'room-page-event', roomId, event })
  }

  const subscriptions = new Map();
  const onSubscribe = async (roomIds) => {
    close();
    for (const roomId of roomIds) {
      // Side Effects
      await roomService.connection.connect(game.id, roomId, connectionId, userId);

      // Subscriptions
      const gameUpdateSubscription = data.gameUpdates.subscribe(game.id, onGameUpdate(roomId));
      const connectionSubscription = roomService.connection.subscribeConnectionChange(game.id, onConnectionUpdate(roomId));

      subscriptions.set(roomId, async () => {
        gameUpdateSubscription.unsubscribe();
        connectionSubscription.unsubscribe();
        await roomService.connection.disconnect(game.id, roomId, connectionId);
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
      await unsubscribe()
    subscriptions.clear();
    return;
  }

  const heartbeat = () => {
    for (const [roomId] of subscriptions) {
      roomService.connection.heartbeat(game.id, roomId, connectionId);
    }
  }

  return { close, update, heartbeat }
}