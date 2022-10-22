// @flow strict
/*::
import type { MagicItemAPI } from "../../models/api/game/magicItem";
import type {
  AdvancedGameCRUDAPI,
  CRUDGameAPI,
  DeriveGameCRUDDescription,
} from "../../models/api/game/meta";
import type { HTTPServiceClient } from '../wildspace.js';
import type { GameCRUDClient } from "./meta";
import type { GameID, MagicItem, MagicItemID } from "@astral-atlas/wildspace-models";
*/

import { magicItemAPI } from "@astral-atlas/wildspace-models";
import { createGameCRUDClient } from "./meta";

/*::

export type MagicItemClient = GameCRUDClient<DeriveGameCRUDDescription<MagicItemAPI['/games/magicItem']>>;
*/

export const createMagicItemClient = (http/*: HTTPServiceClient*/)/*: MagicItemClient*/ => {

  return createGameCRUDClient(http, magicItemAPI['/games/magicItem'], {
    idName: 'magicItemId',
    name: 'magicItem'
  })
}