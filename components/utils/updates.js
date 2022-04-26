// @flow strict

import { useState } from "@lukekaalim/act";
import { useConnection } from "./connect.js";

/*::
import type { GameID } from "@astral-atlas/wildspace-models";
import type { GameClient } from "@astral-atlas/wildspace-client2";

export type GameUpdateTimes = {
  players: number,
  tracks: number,
  playlists: number,
  locations: number,
  scenes: number,
}
*/

export const useGameUpdateTimes = (
  gameClient/*: GameClient*/,
  gameId/*: GameID*/
)/*: GameUpdateTimes*/ => {
  const [updateTimes, setUpdateTimes] = useState/*:: <GameUpdateTimes>*/({
    players: 0,
    tracks: 0,
    playlists: 0,
    scenes: 0,
    locations: 0,
  });
  useConnection(async () => gameClient.connectUpdates(gameId, update => {
    switch (update.type) {
      case 'players':
        return setUpdateTimes(t => ({ ...t, players: Date.now() }))
      case 'tracks':
        return setUpdateTimes(t => ({ ...t, tracks: Date.now() }))
      case 'playlists':
        return setUpdateTimes(t => ({ ...t, playlists: Date.now() }))
      case 'scenes':
        return setUpdateTimes(t => ({ ...t, scenes: Date.now() }))
      case 'locations':
        return setUpdateTimes(t => ({ ...t, locations: Date.now() }))
    }
  }).close)
  return updateTimes;
};