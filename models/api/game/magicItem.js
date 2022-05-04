// @flow strict
/*:: import type { ResourceDescription } from "@lukekaalim/net-description"; */

/*::
import type { Cast } from '@lukekaalim/cast';

import type { CRUDGameAPI } from './meta.js';

import type {
  MagicItem, MagicItemID,
} from "../../game/index.js";
*/

import { createCRUDGameAPI } from './meta.js';
import { castMagicItem, castMagicItemId } from "../../game/index.js";

/*::
export type MagicItemAPI = CRUDGameAPI<MagicItem, "magicItem", MagicItemID>
*/

const magicItemResource/*: ResourceDescription<MagicItemAPI>*/ = createCRUDGameAPI(
  '/games/magicItem', 'magicItem', castMagicItem, castMagicItemId
);

export const magicItemAPI = {
  '/games/magicItem': magicItemResource
};