// @flow strict

import { c } from "@lukekaalim/cast";
import { castGameConnectionId } from "../game.js";
import { castRoomId } from "./room.js";
import { castUserId } from "@astral-atlas/sesame-models";

/*::
import type { Cast } from "@lukekaalim/cast";
import type { GameConnectionID } from "../game/connection";
import type { RoomID } from "./room";
import type { UserID } from "@astral-atlas/sesame-models";

export type RoomConnectionState = {
  gameConnectionId: GameConnectionID,
  roomId: RoomID,
  userId: UserID
};
*/

export const castRoomConnectionState/*: Cast<RoomConnectionState>*/ = c.obj({
  gameConnectionId: castGameConnectionId,
  roomId: castRoomId,
  userId: castUserId
});
