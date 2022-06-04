// @flow strict
/*::
import type { AdvancedUpdateChannelDescription } from "./meta";
import type { LibraryData, LibraryEvent } from "../../../game/library";
*/

import { c } from "@lukekaalim/cast";
import { castLibraryData } from "../../../game/library.js";
import { castLibraryEvent } from "../../../game/library.js";
/*::

export type LibraryChannel = {
  Client: { type: 'library-subscribe' },
  Server: { type: 'library-event', event: LibraryEvent }
}
*/

export const libraryChannel/*: AdvancedUpdateChannelDescription<LibraryChannel>*/ = {
  eventPrefix: 'library',
  castClientEvent: c.obj({ type: c.lit('library-subscribe') }),
  castServerEvent: c.obj({ type: c.lit('library-event'), event: castLibraryEvent })
}
