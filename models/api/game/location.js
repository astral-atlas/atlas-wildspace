// @flow strict
/*:: import type { ResourceDescription } from "@lukekaalim/net-description"; */

/*::
import type { Cast } from '@lukekaalim/cast';

import type { CRUDGameAPI } from './meta.js';

import type {
  Location, LocationID,
} from "../../game/index.js";
*/

import { createCRUDGameAPI } from './meta.js';
import { castLocation, castLocationId } from "../../game/index.js";

/*::
export type LocationAPI = {|
  '/games/location': CRUDGameAPI<Location, 'location', LocationID>,
|};
*/

export const location/*: ResourceDescription<LocationAPI['/games/location']>*/ = createCRUDGameAPI(
  '/games/location',
  'location',
  castLocation,
  castLocationId,
)

export const locationAPI = {
  '/games/location': location,
};
