// @flow strict
/*::
import type { HTTPServiceClient } from "../wildspace";
import type { GameID, AdvancedGameCRUDAPI, AdvancedGameCRUDAPIDescription } from "@astral-atlas/wildspace-models";
import type { GameResource, GameResourceDescription, GameResourceInputMetadata } from "@astral-atlas/wildspace-models";
import type { ResourceDescription } from "@lukekaalim/net-description";
*/
/*::

export type GameCRUDClient<T: AdvancedGameCRUDAPIDescription> = {|
  create: (gameId: GameID, T["resourcePostInput"]) => Promise<T["resource"]>,
  read: (gameId: GameID) => Promise<$ReadOnlyArray<T["resource"]>>,
  update: (gameId: GameID, T["resourceId"], T["resourcePutInput"]) => Promise<T["resource"]>,
  destroy: (gameId: GameID, T["resourceId"]) => Promise<void>,
|}
*/

import { createStandardGameAPIDescription } from "@astral-atlas/wildspace-models";

export const createGameCRUDClient = /*:: <T: AdvancedGameCRUDAPIDescription>*/(
  http/*: HTTPServiceClient*/,
  resource/*: ResourceDescription<AdvancedGameCRUDAPI<T>>*/,
  implementation/*: { name: T["resourceName"], idName: T["resourceIdName"] }*/
)/*: GameCRUDClient<T>*/ => {
  const httpResource = http.createResource(resource);

  const create = async (gameId, input) => {
    const { body: { [implementation.name]: result } } = await httpResource.POST({ body: { gameId, [implementation.name]: input } })
    return result;
  };
  const read = async (gameId) => {
    const { body: { [implementation.name]: result } } = await httpResource.GET({ query: { gameId } });
    return result;
  };
  const update = async (gameId, resourceId, input) => {
    const { body: { [implementation.name]: result } } = await httpResource.PUT({
      query: { gameId, [implementation.idName]: resourceId },
      body: { [implementation.name]: input }
    });
    return result;
  };
  const destroy = async (gameId, resourceId) => {
    await httpResource.DELETE({ query: { gameId, [implementation.idName]: resourceId } });
  }
  
  return { create, read, update, destroy };
}

/*::
export type GameResourceClient<T: GameResourceDescription<any>> = {
  create: (
    game: GameID,
    input: { ...T["input"], ...GameResourceInputMetadata }
  ) => Promise<T["resource"]>,
  read: (
    game: GameID,
  ) => Promise<$ReadOnlyArray<T["resource"]>>,
  update: (
    game: GameID,
    id:  T["resource"]["id"],
    input: { ...T["input"], ...GameResourceInputMetadata }
  ) => Promise<T["resource"]>,
  destroy: (
    game: GameID,
    id:  T["resource"]["id"],
  ) => Promise<T["resource"]>,
};
*/

export const createGameResourceClient = /*:: <T: GameResourceDescription<any>>*/(
  resourceSpec/*: GameResource<T>["asGameResourceSpec"]*/,
  http/*: HTTPServiceClient*/,
)/*: GameResourceClient<T>*/ => {
  const desc = createStandardGameAPIDescription(resourceSpec);
  const api = http.createResource(desc)

  const create = async (gameId, input) => {
    const { body } = await api.POST({ body: { create: input, gameId } });
    switch (body.type) {
      case 'created':
        return body.resource;
      default:
        throw new Error();
    }
  }
  const read = async (gameId) => {
    const { body } = await api.GET({ query: { gameId } });
    switch (body.type) {
      case 'found':
        return body.resources;
      default:
        throw new Error();
    }
  };
  const update = async (gameId, id, input) => {
    const { body } = await api.PUT({ body: { update: input }, query: { gameId, id } });
    switch (body.type) {
      case 'updated':
        return body.resource;
      default:
        throw new Error();
    }
  };
  const destroy = async (gameId, id) => {
    const { body } = await api.DELETE({ query: { gameId, id } });
    switch (body.type) {
      case 'deleted':
        return body.resource;
      default:
        throw new Error();
    }
  };
  return { create, read, update, destroy };
}
