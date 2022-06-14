// @flow strict
/*::
import type { AdvancedUpdateChannelDescription } from "./meta";
import type { LibraryData, LibraryEvent } from "../../../game/library";
import type { GameID, GamePage, GamePageEvent } from "../../../game.js";
import type { Cast } from "@lukekaalim/cast";
*/

import { c } from "@lukekaalim/cast";
import { castGamePageEvent, reduceGamePageEvent } from "../../../game.js";

/*::
export type GamePageChannel = {
  Resource: GamePage,
  Client: { type: 'game-page-subscribe' },
  Server: { type: 'game-page-event', event: GamePageEvent }
}
*/

export const gamePageChannel/*: AdvancedUpdateChannelDescription<GamePageChannel>*/ = {
  eventPrefix: 'game-page',
  castClientEvent: c.obj({ type: c.lit('game-page-subscribe') }),
  castServerEvent: c.obj({ type: c.lit('game-page-event'), event: castGamePageEvent }),
  reduceResource(data, { event }) {
    return reduceGamePageEvent(data, event)
  }
}
