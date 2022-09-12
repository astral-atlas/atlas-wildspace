// @flow strict
/*::
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { GameID, GamePageChannel } from "@astral-atlas/wildspace-models";
import type { ServerUpdateChannel } from "./meta";
import type { ServerGameUpdateChannel } from "../update";
import type { GameService } from "../game";
import type { RoomService } from "../room";
import type { PageService } from "../page";
*/

/*::
export type ServerGamePageChannel = ServerUpdateChannel<GamePageChannel>;
*/

export const createServerGamePageChannel = (
  data/*: WildspaceData*/,
  pageService/*: PageService*/,
  roomService/*: RoomService*/,
  { game, send, identity, userId }/*: ServerGameUpdateChannel*/
)/*: ServerGamePageChannel*/ => {
  const onGameUpdate = async (gameUpdateEvent) => {
    const page = await pageService.getGamePage(game.id, identity, game.gameMasterId === userId);
    if (!page)
      return;
    const event = { type: 'next-page', page };
    send({ type: 'game-page-event', event })
  }
  const onRoomConnectionUpdate = async (update) => {
    const event = {
      type: 'room-connections-change',
      connections: update.counts
    };
    send({ type: 'game-page-event', event })
  }

  let unsubscribeAll = null
  const onSubscribe = () => {
    close();
    const gameSubscription = data.gameUpdates.subscribe(game.id, onGameUpdate);
    const connectionSubscription = roomService.connection.subscribeConnectionChange(game.id, onRoomConnectionUpdate);
    unsubscribeAll = () => {
      gameSubscription.unsubscribe();
      connectionSubscription.unsubscribe();
    }
  };

  const update = (message) => {
    switch (message.type) {
      case "game-page-subscribe":
        return void onSubscribe();
    }
  };

  const close = async () => {
    if (unsubscribeAll)
      unsubscribeAll();
  }
  return { close, update }
}