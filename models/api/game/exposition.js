// @flow strict
/*::
import type { AdvancedGameCRUDAPI } from "./meta";
import type { ResourceDescription } from "@lukekaalim/net-description";
import type { InitativeID, Initiative } from "../../game/initiative";
import type { GameID } from "../../game/game";
import type { CharacterID } from "../../character";
import type { Exposition } from "../../game/exposition";
*/

import { c } from "@lukekaalim/cast";
import { castInitiative, castInitiativeId } from "../../game/initiative.js";
import { createAdvancedCRUDGameAPI, createCRUDGameAPI } from "./meta.js";
import { castGameId } from "../../game/game.js";
import { castCharacterId } from "../../character.js";
import { castExposition } from "../../game/exposition.js";

/*::
type ExpositionResource = AdvancedGameCRUDAPI<{
  resource: Exposition,
  resourceName: 'exposition',
  resourceId: ExpositionID,
  resourceIdName: 'expositionId',

  resourcePostInput: { name: string },
  resourcePutInput: Exposition,
}>

export type ExpositionAPI = {|
  '/games/exposition': ExpositionResource,
|}
*/

const exposition/*: ResourceDescription<ExpositionResource>*/ = createAdvancedCRUDGameAPI({
  path: '/games/exposition',
  castResource: castExposition,
  castResourceId: c.str,
  resourceName: 'exposition',
  resourceIdName: 'expositionId',
  castPostResource: c.obj({ name: c.str }),
  castPutResource: castExposition,
});

export const expositionAPI = {
  '/games/exposition': exposition,
};
