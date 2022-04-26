// @flow strict
/*::
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { GameID, RoomID, RoomState } from "@astral-atlas/wildspace-models";
*/

import { reduceRoomState } from "@astral-atlas/wildspace-models";
import { useState, useEffect } from "@lukekaalim/act";
import { useConnection } from "../utils";
import { useAsync } from "../utils/async";

/*::
export type RoomData = {|
  ...RoomState,
|};
*/


export const useRoomState = (
  gameId/*: GameID*/,
  roomId/*: GameID*/,
  client/*: WildspaceClient*/
)/*: ?RoomData*/ => {
  const [modifiedRoomState, setModifiedRoomState] = useState/*:: <?RoomState>*/(null)

  const [initialRoomState] = useAsync(async () => client.room.state.get(gameId, roomId), [gameId, roomId]);

  useConnection(async () => {
    if (!initialRoomState)
      return;

    const connection = await client.room.state.connect(gameId, roomId, event => {
      setModifiedRoomState(prevModifiedState => {
        return reduceRoomState(prevModifiedState || initialRoomState, event);
      })
    })

    return connection.close;
  }, [initialRoomState, gameId, roomId]);

  return modifiedRoomState || initialRoomState;
};

