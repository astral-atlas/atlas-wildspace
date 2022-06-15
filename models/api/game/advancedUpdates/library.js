// @flow strict
/*::
import type { AdvancedUpdateChannelDescription } from "./meta";
import type { LibraryData, LibraryEvent } from "../../../game/library";
import type { Cast } from "@lukekaalim/cast";
*/

import { c } from "@lukekaalim/cast";
import { castLibraryData } from "../../../game/library.js";
import { castLibraryEvent } from "../../../game/library.js";
import { reduceLibraryEvent } from "../../../game/library.js";
/*::

export type LibraryChannel = {
  Resource: LibraryData,
  Client: { type: 'library-subscribe' } | { type: 'library-unsubscribe' },
  Server: { type: 'library-event', event: LibraryEvent }
}
*/

export const libraryChannel/*: AdvancedUpdateChannelDescription<LibraryChannel>*/ = {
  eventPrefix: 'library',
  castClientEvent: c.or('type', {
    'library-subscribe': c.obj({ type: (c.lit('library-subscribe')/*: Cast<'library-subscribe'>*/) }),
    'library-unsubscribe': c.obj({ type: (c.lit('library-unsubscribe')/*: Cast<'library-unsubscribe'>*/) })
  }),
  castServerEvent: c.obj({ type: c.lit('library-event'), event: castLibraryEvent }),
  reduceResource(data, { event }) {
    return reduceLibraryEvent(data, event)
  }
}
