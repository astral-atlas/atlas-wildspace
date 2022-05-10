// @flow strict
/*::
import type { HTTPServiceClient } from "../wildspace";
import type { GameID, AdvancedGameCRUDAPI, AdvancedGameCRUDAPIDescription } from "@astral-atlas/wildspace-models";
import type { ResourceDescription } from "@lukekaalim/net-description";
*/
/*::

export type GameCRUDClient<T: AdvancedGameCRUDAPIDescription> = {
  create: (gameId: GameID, T["resourcePostInput"]) => Promise<T["resource"]>,
  read: (gameId: GameID) => Promise<$ReadOnlyArray<T["resource"]>>,
  update: (gameId: GameID, T["resourceId"], T["resourcePutInput"]) => Promise<T["resource"]>,
  destroy: (gameId: GameID, T["resourceId"]) => Promise<void>,
}
*/

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