// @flow strict
/*:: import type { ResourceDescription } from "@lukekaalim/net-description"; */

/*::
import type { Cast } from '@lukekaalim/cast';

import type { AdvancedGameCRUDAPI } from "./meta";

import type {
  MagicItem, MagicItemID,
} from "../../game/index.js";
*/

import { castMagicItem } from "../../game/index.js";
import { createAdvancedCRUDGameAPI } from "./meta.js";
import { c } from '@lukekaalim/cast';

/*::
export type MagicItemAPI = {|
  '/games/magicItem': AdvancedGameCRUDAPI<{
    resource: MagicItem,
    resourceId: MagicItemID,
    resourceIdName: 'magicItemId',
    resourceName: 'magicItem',
    resourcePostInput: {
      title: string,
    },
    resourcePutInput: MagicItem
  }>;
|}
*/

const magicItemResource/*: ResourceDescription<MagicItemAPI['/games/magicItem']>*/ = createAdvancedCRUDGameAPI({
  path: '/games/magicItem',
  resourceName: 'magicItem',
  resourceIdName: 'magicItemId',
  castResource: castMagicItem,
  castPostResource: c.obj({ title: c.str }),
  castPutResource: castMagicItem,
});

export const magicItemAPI = {
  '/games/magicItem': magicItemResource
};