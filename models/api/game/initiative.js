// @flow strict
/*::
import type { AdvancedGameCRUDAPI } from "./meta";
import type { ResourceDescription } from "@lukekaalim/net-description";
import type { InitativeID, Initiative } from "../../game/initiative";
import type { GameID } from "../../game/game";
import type { CharacterID } from "../../character";
*/

import { c } from "@lukekaalim/cast";
import { castInitiative, castInitiativeId } from "../../game/initiative.js";
import { createAdvancedCRUDGameAPI, createCRUDGameAPI } from "./meta.js";
import { castGameId } from "../../game/game.js";
import { castCharacterId } from "../../character.js";

/*::
type InitiativeResource = AdvancedGameCRUDAPI<{
  resource: Initiative,
  resourceName: 'initiative',
  resourceId: InitativeID,
  resourceIdName: 'initiativeId',

  resourcePostInput: { name: string },
  resourcePutInput: { name: string },
}>

type EnterResource = {|
  POST: {
    query: { gameId: GameID, initiativeId: InitativeID },
    request: { characterId: CharacterID, value: number },
  }
|};
type EndTurnResource = {|
  POST: {
    query: { gameId: GameID, initiativeId: InitativeID },
    request: { turn: number },
  }
|};

export type InitiativeAPI = {|
  '/initiative': InitiativeResource,
  '/initiative/enter': EnterResource,
  '/initiative/turn/end': EndTurnResource,
|}
*/

const initiative/*: ResourceDescription<InitiativeResource>*/ = createAdvancedCRUDGameAPI({
  path: '/initiative',
  castResource: castInitiative,
  castResourceId: castInitiativeId,
  resourceName: 'initiative',
  resourceIdName: 'initiativeId',
  castPostResource: c.obj({ name: c.str }),
  castPutResource: c.obj({ name: c.str }),
});

const enter/*: ResourceDescription<EnterResource>*/ = {
  path: '/initiative/enter',

  POST: {
    toQuery: c.obj({ gameId: castGameId, initiativeId: castInitiativeId }),
    toRequestBody: c.obj({ characterId: castCharacterId, value: c.num }),
  }
}
const endTurn/*: ResourceDescription<EndTurnResource>*/ = {
  path: '/initiative/turn/end',

  POST: {
    toQuery: c.obj({ gameId: castGameId, initiativeId: castInitiativeId }),
    toRequestBody: c.obj({ turn: c.num }),
  }
}

export const initiativeAPI = {
  '/initiative': initiative,
  '/initiative/enter': enter,
  '/initiative/turn/end': endTurn,
};
