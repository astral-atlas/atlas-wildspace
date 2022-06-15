// @flow strict
/*::
import type { GameConnectionID } from "../connection";
import type { UserID } from "@astral-atlas/sesame-models/src/user";
import type { Cast } from "@lukekaalim/cast/main";
*/

import { castUserId } from "@astral-atlas/sesame-models";
import { c } from "@lukekaalim/cast";
import { castGameConnectionId } from "../connection.js";

/*::
export type WikiDocConnection = {
  gameConnectionId: GameConnectionID,
  userId: UserID
}
*/

export const castWikiDocConnection/*: Cast<WikiDocConnection>*/ = c.obj({
  gameConnectionId: castGameConnectionId,
  userId: castUserId
})