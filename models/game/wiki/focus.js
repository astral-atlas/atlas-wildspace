// @flow strict
/*::
import type { GameID } from "../game";
import type { GameConnectionID } from "../connection";
import type { LobbyConnectionID } from "../../room/lobby";
import type { WikiDocID } from "./doc";
import type { UserID } from "@astral-atlas/sesame-models";
import type { Cast } from "@lukekaalim/cast/main";
*/

import { c } from "@lukekaalim/cast";
import { castUserId } from "@astral-atlas/sesame-models";

import { castGameConnectionId } from "../../game.js";

/*::
export type WikiDocFocus = {
  connectionId: GameConnectionID,
  userId: UserID,

  selection: { from: number, to: number }
};
*/

export const castWikiDocFocus/*: Cast<WikiDocFocus>*/ = c.obj({
  connectionId: castGameConnectionId,
  userId: castUserId,

  selection: c.obj({ from: c.num, to: c.num }),
});

/*::
export type WikiDocFocusAction = {
  from: number,
  to: number,
};
*/

export const castWikiDocFocusAction/*: Cast<WikiDocFocusAction>*/ = c.obj({
  from: c.num,
  to: c.num 
});
