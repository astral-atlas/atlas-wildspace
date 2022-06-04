// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description"; */
/*:: import type { GameID, Game, GameMaster, Player } from '../../game.js'; */
/*:: import type { Monster, MonsterID } from '../../character.js'; */
/*::
import type { MonsterActor, MonsterActorID } from "../../monster/monsterActor";
import type {
  AdvancedGameCRUDAPI,
  AdvancedGameCRUDAPIDescription,
} from "./meta";
*/

import { c } from '@lukekaalim/cast';
import { castGameId } from '../../game.js';
import { castMonster, castMonsterId } from "../../character.js";
import { createAdvancedCRUDGameAPI } from "./meta.js";
import { castMonsterActor } from "../../monster/monsterActor.js";

/*::
export type MonstersAPI = {|
  '/games/monsters': {|
    GET: {
      query: { gameId: GameID },
      request: empty,
      response: { type: 'found', monsters: $ReadOnlyArray<Monster> },
    },
    POST: {
      query: empty,
      request: { gameId: GameID },
      response: { type: 'created', monster: Monster },
    },
    PUT: {
      query: { gameId: GameID, monsterId: MonsterID },
      request: { monster: Monster },
      response: { type: 'updated' },
    },
    DELETE: {
      query: { gameId: GameID, monsterId: MonsterID },
      request: empty,
      response: { type: 'deleted' },
    }
  |},
  '/games/monsters/actors': AdvancedGameCRUDAPI<{
    resource: MonsterActor,
    resourceName: 'monsterActor',
    resourceId: MonsterActorID,
    resourceIdName: 'monsterActorId',
  
    resourcePostInput: { name: string, monsterId: MonsterID },
    resourcePutInput: {
      name: ?string,
      secretName: ?string,
      conditions: ?$ReadOnlyArray<string>,
      hitpoints: ?number,
    },
  }>,
|};
*/

export const gameMonsters/*: ResourceDescription<MonstersAPI['/games/monsters']>*/ = {
  path: '/games/monsters',

  GET: {
    toQuery: c.obj({ gameId: castGameId }),
    toResponseBody: c.obj({ type: c.lit('found'), monsters: c.arr(castMonster) }),
  },
  POST: {
    toRequestBody: c.obj({ gameId: castGameId, name: c.str }),
    toResponseBody: c.obj({ type: c.lit('created'), monster: castMonster }),
  },
  PUT: {
    toQuery: c.obj({ gameId: castGameId, monsterId: castMonsterId }),
    toRequestBody: c.obj({ monster: castMonster }),
    toResponseBody: c.obj({ type: c.lit('updated') }),
  },
  DELETE: {
    toQuery: c.obj({ gameId: castGameId, monsterId: castMonsterId }),
    toResponseBody: c.obj({ type: c.lit('deleted') }),
  },
};

export const monsterActors/*: ResourceDescription<MonstersAPI['/games/monsters/actors']>*/ = createAdvancedCRUDGameAPI({
  path: '/games/monsters/actors',
  castResource: castMonsterActor,
  resourceName: 'monsterActor',
  resourceIdName: 'monsterActorId',
  castPostResource: c.obj({
    name: c.str,
    monsterId: castMonsterId,
  }),
  castPutResource: c.obj({
    name: c.maybe(c.str),
    secretName: c.maybe(c.str),
    conditions: c.maybe(c.arr(c.str)),
    hitpoints: c.maybe(c.num),
  }),
})

export const monstersAPI = {
  '/games/monsters': gameMonsters,
  '/games/monsters/actors': monsterActors,
};
