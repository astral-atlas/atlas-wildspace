// @flow strict
/*::
import type { GameUpdatesConnection } from "../updates";
import type { GameUpdateChannel, SingletonUpdateChannel } from "./meta";
import type { PageClient } from "../page";
import type {
  GameID, GamePage
} from "@astral-atlas/wildspace-models";
import type { GameClient } from "../game";
*/

import { reduceGamePageEvent, reduceRoomPageEvent, roomPageChannel } from "@astral-atlas/wildspace-models";
import { createSingletonUpdateChannel, createUpdateChannel } from "./meta";

/*::
export type GamePageConnection = SingletonUpdateChannel<GamePage>;
*/

export const createGamePageConnection = (
  game/*: GameClient*/,
  page/*: PageClient*/,
  updates/*: GameUpdatesConnection*/,
)/*: GamePageConnection*/ => {
  const channel = createSingletonUpdateChannel({
    reduceResource(page, event) {
      switch (event.type) {
        case 'game-page-event':
          const { event: gamePageEvent } = event;
          return reduceGamePageEvent(page, gamePageEvent);
        default:
          return page;
      }
    },
    async getResource() {
      return await page.getGamePage(updates.gameId);
    },
    createSubscribeMessage() {
      return { type: 'game-page-subscribe' };
    }
  }, updates);
  return channel; 
}