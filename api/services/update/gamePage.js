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
  { gameId, send }/*: ServerGameUpdateChannel*/
)/*: ServerGamePageChannel*/ => {
  const onGameUpdate = async (gameUpdateEvent) => {
    const page = await gameService.getGamePage(gameId);
    if (!page)
      return;
    const event = { type: 'next-page', page };
    send({ type: 'game-page-event', event })
  }

  let subscription = null
  const onSubscribe = () => {
    close();
    subscription = data.gameUpdates.subscribe(gameId, onGameUpdate);
  };

  const update = (message) => {
    switch (message.type) {
      case "game-page-subscribe":
        return void onSubscribe();
    }
  };

  const close = async () => {
    if (subscription)
      subscription.unsubscribe();
  }
  return { close, update }
}