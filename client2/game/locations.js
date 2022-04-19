// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*::  */
/*:: import type { HTTPServiceClient } from '../wildspace.js'; */
import { locationAPI } from "@astral-atlas/wildspace-models";

/*::
import type {
  GameID,
  Location, LocationID
} from '@astral-atlas/wildspace-models';

export type LocationClient = {
  list: (gameId: GameID) => Promise<$ReadOnlyArray<Location>>,
  create: (gameId: GameID) => Promise<Location>,
  update: (gameId: GameID, updatedLocation: Location) => Promise<void>,
  destroy: (gameId: GameID, locationId: LocationID) => Promise<void>,
};
*/

export const createLocationClient = (service/*: HTTPServiceClient*/)/*: LocationClient*/ => {
  const locationsResource = service.createResource(locationAPI["/games/location"]);

  const list = async (gameId) => {
    const { body: { location } } = await locationsResource.GET({ query: { gameId } });
    return location;
  };
  const create = async (gameId) => {
    const { body: { location } } = await locationsResource.POST({ body: { gameId } });
    return location;
  }
  const update = async (gameId, updatedLocation) => {
    await locationsResource.PUT({ query: { gameId, location: updatedLocation.id }, body: { location: updatedLocation } });
  }
  const destroy = async (gameId, locationId) => {
    await locationsResource.DELETE({ query: { gameId, location: locationId } });
  }

  return { list, create, update, destroy };
};