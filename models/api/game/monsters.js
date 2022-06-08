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
  '/games/monsters': AdvancedGameCRUDAPI<{
    resource: Monster,
    resourceName: 'monster',
    resourceId: MonsterID,
    resourceIdName: 'monsterId',
  
    resourcePostInput: { name: string },
    resourcePutInput: Monster,
  }>,
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

export const gameMonsters/*: ResourceDescription<MonstersAPI['/games/monsters']>*/ = createAdvancedCRUDGameAPI({
  path: '/games/monsters',
  castResource: castMonster,
  resourceName: 'monster',
  resourceIdName: 'monsterId',
  castPostResource: c.obj({
    name: c.str,
  }),
  castPutResource: castMonster,
})

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
