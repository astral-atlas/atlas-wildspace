// @flow strict
/*::
import type { WildspaceData } from "@astral-atlas/wildspace-data";
import type { GameID, GamePageChannel } from "@astral-atlas/wildspace-models";
import type { ServerUpdateChannel } from "./meta";
import type { ServerGameUpdateChannel } from "../update";
import type { GameService } from "../game";
*/

/*::
export type ServerGamePageChannel = ServerUpdateChannel<GamePageChannel>;
*/

export const createServerGamePageChannel = (
  data/*: WildspaceData*/,
  gameService/*: GameService*/,
  { gameId, send, identity }/*: ServerGameUpdateChannel*/
)/*: ServerGamePageChannel*/ => {
  const onGameUpdate = async (gameUpdateEvent) => {
    const page = await gameService.getGamePage(gameId, identity);
    if (!page)
      return;
    const event = { type: 'next-page', page };
    send({ type: 'game-page-event', event })
  }
  const onRoomLobbyUpdate = async ({ roomId, state }) => {
    const event = { type: 'update-lobby-state', roomId, roomLobbyState: state }
    send({ type: 'game-page-event', event })
  }

  let unsubscribeAll = null
  const onSubscribe = () => {
    close();
    const gameSubscription = data.gameUpdates.subscribe(gameId, onGameUpdate);
    const roomSubscription = data.roomData.lobbyUpdates.subscribe(gameId, onRoomLobbyUpdate);
    unsubscribeAll = () => {
      gameSubscription.unsubscribe();
      roomSubscription.unsubscribe();
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