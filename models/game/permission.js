// @flow strict

import { castUserId } from "@astral-atlas/sesame-models";
import { c, castArray, createArrayCaster } from "@lukekaalim/cast";
import { createTypedUnionCaster } from "../castTypedUnion.js";

/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type { Cast } from "@lukekaalim/cast";

export type GamePermission =
  | { type: 'game-master-in-game' }
  | { type: 'players-in-game' }
  | { type: 'custom-players-in-game', players: $ReadOnlyArray<UserID>  }
*/

export const castGamePermission/*: Cast<GamePermission>*/ = createTypedUnionCaster((type, object) => {
  switch (type) {
    case 'game-master-in-game':
      return { type: 'game-master-in-game' };
    case 'players-in-game':
      return { type: 'players-in-game' };
    case 'custom-players-in-game':
      return { type: 'custom-players-in-game', players: c.arr(castUserId)(object.players) }
  }
})
