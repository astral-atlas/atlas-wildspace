// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Character, CharacterID, GameID, Player } from '@astral-atlas/wildspace-models'; */
/*:: import type { HTTPServiceClient } from '../wildspace.js'; */
/*::
import type { GameCRUDClient } from "./meta";
import type { DeriveGameCRUDDescription } from "../../models/api/game/meta";
import type { GameAPI } from "../../models/api/game";
*/
import { gameAPI, playersAPI } from "@astral-atlas/wildspace-models";
import { createGameCRUDClient } from "./meta";

/*::
export type RoomClient = GameCRUDClient<DeriveGameCRUDDescription<GameAPI["/games/rooms"]>>;
*/

export const createRoomClient = (http/*: HTTPServiceClient*/)/*: RoomClient*/ => {  
  return createGameCRUDClient(http, gameAPI["/games/rooms"], {
    name: 'room',
    idName: 'roomId'
  })
};