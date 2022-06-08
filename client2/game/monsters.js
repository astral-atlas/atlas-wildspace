// @flow strict
/*::
import type {
  DeriveGameCRUDDescription,

  GameID,
  GameAPI,
  MiniTheater,
  MiniTheaterAction,
  MiniTheaterID,
} from "@astral-atlas/wildspace-models";
import type { GameCRUDClient } from "./meta";
import type { HTTPServiceClient } from "../wildspace";
*/

import { gameAPI } from "@astral-atlas/wildspace-models"
import { createGameCRUDClient } from "./meta.js";


/*::
export type MonsterClient = {|
  ...GameCRUDClient<DeriveGameCRUDDescription<GameAPI["/games/monsters"]>>,
  actors: GameCRUDClient<DeriveGameCRUDDescription<GameAPI["/games/monsters/actors"]>>
|};
*/

export const createMonsterClient = (http/*: HTTPServiceClient*/)/*: MonsterClient*/ => {
  const monsterClient = createGameCRUDClient(http, gameAPI["/games/monsters"], { idName: 'monsterId', name: 'monster' })
  const actors = createGameCRUDClient(http, gameAPI["/games/monsters/actors"], { idName: 'monsterActorId', name: 'monsterActor' })
  return {
    ...monsterClient,
    actors,
  }
}