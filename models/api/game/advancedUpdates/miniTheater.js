// @flow strict

import { c } from "@lukekaalim/cast";
import {
  castMiniTheaterEvent,
  castMiniTheaterId,
} from "../../../game/miniTheater.js";

/*::
import type {
  MiniTheaterEvent,
  MiniTheaterID,
} from "../../../game/miniTheater";
import type { AdvancedUpdateChannelDescription } from "./meta";

export type MiniTheaterChannel = {
  Client: { type: 'mini-theater-subscribe', miniTheaterIds: $ReadOnlyArray<MiniTheaterID> },
  Server: { type: 'mini-theater-event', miniTheaterId: MiniTheaterID, miniTheaterEvent: MiniTheaterEvent }
}
*/

export const miniTheaterChannel/*: AdvancedUpdateChannelDescription<MiniTheaterChannel>*/ = {
  eventPrefix: 'mini-theater',
  castClientEvent: c.obj({ type: c.lit('mini-theater-subscribe'), miniTheaterIds: c.arr(castMiniTheaterId) }),
  castServerEvent: c.obj({ type: c.lit('mini-theater-event'), miniTheaterId: castMiniTheaterId, miniTheaterEvent: castMiniTheaterEvent })
}
