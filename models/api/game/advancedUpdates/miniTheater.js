// @flow strict
/*::
import type {
  MiniTheater,
  MiniTheaterAction,
  MiniTheaterEvent,
  MiniTheaterID,
} from "../../../game/miniTheater";
import type { AdvancedUpdateChannelDescription } from "./meta";
*/

import { c } from "@lukekaalim/cast";
import {
  castMiniTheaterEvent,
  castMiniTheaterId,
} from "../../../game/miniTheater.js";
import { reduceMiniTheaterEvent } from "../../../game/miniTheater.js";
import { castMiniTheaterAction } from "../../../game/miniTheater.js";

/*::
export type MiniTheaterChannel = {
  Resource: MiniTheater,
  Client:
  | { type: 'mini-theater-action', miniTheaterId: MiniTheaterID, miniTheaterAction: MiniTheaterAction }
  | { type: 'mini-theater-subscribe', miniTheaterIds: $ReadOnlyArray<MiniTheaterID> },
  Server: { type: 'mini-theater-event', miniTheaterId: MiniTheaterID, miniTheaterEvent: MiniTheaterEvent }
}
*/

export const miniTheaterChannel/*: AdvancedUpdateChannelDescription<MiniTheaterChannel>*/ = {
  eventPrefix: 'mini-theater',
  castClientEvent: c.or('type', {
    'mini-theater-action': c.obj({ type: c.lit('mini-theater-action'), miniTheaterId: castMiniTheaterId, miniTheaterAction: castMiniTheaterAction }),
    'mini-theater-subscribe': c.obj({ type: c.lit('mini-theater-subscribe'), miniTheaterIds: c.arr(castMiniTheaterId) })
  }),

  castServerEvent: c.obj({ type: c.lit('mini-theater-event'), miniTheaterId: castMiniTheaterId, miniTheaterEvent: castMiniTheaterEvent }),
  reduceResource(miniTheater, { miniTheaterEvent }) {
    return reduceMiniTheaterEvent(miniTheater, miniTheaterEvent);
  }
}
