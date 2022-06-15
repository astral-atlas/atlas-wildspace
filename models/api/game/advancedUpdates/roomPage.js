// @flow strict
/*::
import type { AdvancedUpdateChannelDescription } from "./meta";
import type { LibraryData, LibraryEvent } from "../../../game/library";
import type { RoomID, RoomPage, RoomPageEvent } from "../../../room.js";
import type { Cast } from "@lukekaalim/cast";
*/

import { c } from "@lukekaalim/cast";
import { castRoomId, castRoomPageEvent, reduceRoomPageEvent } from "../../../room.js";

/*::
export type RoomPageChannel = {
  Resource: RoomPage,
  Client: { type: 'room-page-subscribe', roomIds: $ReadOnlyArray<RoomID> },
  Server: { type: 'room-page-event', roomId: RoomID, event: RoomPageEvent }
}
*/

export const roomPageChannel/*: AdvancedUpdateChannelDescription<RoomPageChannel>*/ = {
  eventPrefix: 'room-page',
  castClientEvent: c.obj({ type: c.lit('room-page-subscribe'), roomIds: c.arr(castRoomId) }),
  castServerEvent: c.obj({ type: c.lit('room-page-event'), roomId: castRoomId, event: castRoomPageEvent }),
  reduceResource(data, { event }) {
    return reduceRoomPageEvent(data, event)
  }
}
