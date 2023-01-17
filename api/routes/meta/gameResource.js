// @flow strict
/*::
import type {
  AccessOptions, CacheOptions,
  RequestHandler, ResourceResponse, ResourceRequest, Route
} from '@lukekaalim/http-server'; 
import type {
  ResourceDescription, ResourceMethod, Resource,
  
  Connection, ConnectionDescription
} from '@lukekaalim/net-description';
import type { AuthorizedResourceConstructor } from "../meta";
*/
/*:: import type { GameID, Game, RoomID, Room } from '@astral-atlas/wildspace-models'; */
/*::
import type { WebSocketRoute, ClientConnection, } from "@lukekaalim/ws-server";
import type { WebSocket } from "ws";
import type { AuthorizedConnection } from '@astral-atlas/wildspace-models'
import type { LinkGrant } from "@astral-atlas/sesame-models";

import type {
  GameResource, GameResourceDescription,
  AdvancedGameCRUDAPI,
  AdvancedGameCRUDAPIDescription,
  GameUpdate,
  GameResourceAPIResponse,
  GameResourceInputMetadata,
  GameMeta,
} from "@astral-atlas/wildspace-models";
import type { DynamoDBTable } from "@astral-atlas/wildspace-data";
*/

/*:: import type { Identity } from "../../services/auth.js"; */
/*:: import type { GameIdentityScope } from "../../services/game.js"; */
/*:: import type { Services } from "../../services.js"; */
import { castGameMetaResource, createStandardGameAPIDescription } from '@astral-atlas/wildspace-models';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { v4, v4 as uuid } from "uuid";


/*::
type GameResourceIncoming<T> = {
  create: ({ input: {| ...T['input'], ...GameResourceInputMetadata |}, game: Game, grant: LinkGrant }),
  read:   ({ game: Game, grant: LinkGrant }),
  update: ({ id: T['resource']['id'],  input: {| ...T['input'], ...GameResourceInputMetadata |}, game: Game, grant: LinkGrant }),
  delete: ({ id: T['resource']['id'],  game: Game, grant: LinkGrant }),
}

export type GameResourceRouteImplementation<T: GameResourceDescription<{}>> = {
  access?: AccessOptions,
  cache?: CacheOptions,

  create: GameResourceIncoming<T>["create"] => Promise<T["resource"]>,
  read:   GameResourceIncoming<T>["read"]   => Promise<$ReadOnlyArray<T["resource"]>>,
  update: GameResourceIncoming<T>["update"] => Promise<T["resource"]>,
  delete: GameResourceIncoming<T>["delete"] => Promise<T["resource"]>,
}

export type DynamoDBGameResourceRouteImplementation<T: GameResourceDescription<{}>> = {
  access?: AccessOptions,
  cache?: CacheOptions,

  database: DynamoDBTable<GameID, T["resource"]["id"], T["resource"]>,
  create: (
    meta: GameMeta<T["resource"]["id"]>,
    input: T["input"],
    prev: null | T["resource"],
  ) => T["resource"],
  onUpdate?: (prev: ?T["resource"], next: ?T["resource"]) => Promise<mixed>,
};

export type ResourceRouteConstructors = {|
  createGameResourceRoutes: <T: GameResourceDescription<{}>>(
    GameResource<T>["asGameResourceSpec"],
    GameResourceRouteImplementation<T>,
  ) => Route[],

  createDynamoDBGameResourceRoute: <T: GameResourceDescription<{}>>(
    GameResource<T>["asGameResourceSpec"],
    DynamoDBGameResourceRouteImplementation<T>
  ) => Route[],
|};
*/

export class PermissionError extends Error {};
export class NotFoundError extends Error {};

export const createGameResourceRouteConstructors = (
  createAuthorizedResource/*: AuthorizedResourceConstructor*/,
)/*: ResourceRouteConstructors*/ => {
  const createGameResourceRoutes = /*::<T: GameResourceDescription<{}>>*/(
    resourceSpec/*: GameResource<T>["asGameResourceSpec"]*/,
    implementation/*: GameResourceRouteImplementation<T>*/
  )/*: Route[]*/ => {
    const api = createStandardGameAPIDescription(resourceSpec);
    const { access, cache } = implementation;

    const scope = { type: 'game-master-in-game' };
    const getGameId = ({ query }) => {
      return query.gameId;
    }
    const getGrant = ({ identity }) => {
      if (identity.type !== 'link')
        throw new PermissionError(`Guests do not have permission to read or write Game Resources`);
      return identity.grant;
    }
    const getHandler = async ({ game, headers, identity, query, routeRequest }) => {
      const grant = getGrant({ identity });
      const resources = await implementation.read({ game, grant })
      return {
        body: { type: 'found', resources },
        status: HTTP_STATUS.ok
      }
    };
    const putHandler = async ({ game, identity, query: { id }, body }) => {
      const grant = getGrant({ identity });
      const resource = await implementation.update({ game, grant, input: body.update, id });
      return {
        body: { type: 'updated', resource },
        status: HTTP_STATUS.ok
      }
    };
    const postHandler = async ({ game, identity, body }) => {
      const grant = getGrant({ identity });
      const resource = await implementation.create({ game, grant, input: body.create });
      return {
        body: { type: 'created', resource },
        status: HTTP_STATUS.ok
      }
    };
    const deleteHandler = async ({ game, identity, query: { id }, body }) => {
      const grant = getGrant({ identity });
      const resource = await implementation.delete({ game, grant, input: body.update, id });
      return {
        body: { type: 'deleted', resource },
        status: HTTP_STATUS.ok
      }
    };
    const handlerMiddlewarer = /*:: <A, R>*/(
      handler/*: A => Promise<ResourceResponse<GameResourceAPIResponse<R>>>*/
    )/*: (a: A) => Promise<ResourceResponse<GameResourceAPIResponse<R>>>*/ => {
      const replacedHandler = async (a)/*: Promise<ResourceResponse<GameResourceAPIResponse<R>>>*/ => {
        try {
          return await handler(a);
        } catch (error) {
          if (error instanceof PermissionError)
            return { body: { type: 'permission-denied', reason: error.message }, status: HTTP_STATUS.forbidden }
          if (error instanceof NotFoundError)
            return { body: { type: 'not-found', reason: error.message }, status: HTTP_STATUS.not_found };
          return { body: { type: 'unknown-error', reason: 'Unknown error' }, status: 500 }
        }
      }
      return replacedHandler;
    };
    return createAuthorizedResource(api, {
      access,
      cache,
    
      GET: { scope , getGameId, handler: handlerMiddlewarer(getHandler) },
      PUT: { scope , getGameId, handler: handlerMiddlewarer(putHandler) },
      POST: { scope , getGameId, handler: handlerMiddlewarer(postHandler) },
      DELETE: { scope , getGameId, handler: handlerMiddlewarer(deleteHandler) },
    });
  }
  const createDynamoDBGameResourceRoute = /*::<T: GameResourceDescription<{}>>*/(
    spec/*: GameResource<T>["asGameResourceSpec"]*/,
    implementation/*: DynamoDBGameResourceRouteImplementation<T>*/
  )/*: Route[]*/ => {
    return createGameResourceRoutes(spec, {
      async create({ game, input }) {
        const meta = {
          version: v4(),
          id: v4(),
          gameId: game.id,
          title: input.title,
          tags: input.tags,
          visibility: input.visibility,
        }
        const item = implementation.create(meta, input, null);
        await implementation.database.set2({
          version: { prev: null, next: meta.version },
          item,
          key: { partition: game.id, sort: meta.id }
        });
        if (implementation.onUpdate)
          await implementation.onUpdate(null, item);
        return item;
      },
      async read({ game }) {
        const { results } = await implementation.database.query(game.id);
        return results.map(r => r.result);
      },
      async update({ game, id, input }) {
        const key = { partition: game.id, sort: id };
        const { result: prevItem } = await implementation.database.get(key);
        if (!prevItem)
          throw new NotFoundError(`Game "${game.name}(${game.id})" does not have terrainProp "${id}"`);
        const version = uuid();
        const meta = {
          version: v4(),
          id,
          gameId: game.id,
          title: input.title,
          tags: input.tags,
          visibility: input.visibility,
        }
        const item = implementation.create(meta, input, prevItem);
        await implementation.database.set2({
          key,
          item,
          version: { prev: null, next: version }
        });
        if (implementation.onUpdate)
          await implementation.onUpdate(prevItem, item);
        return item;
      },
      async delete({ game, id }) {
        const key = { partition: game.id, sort: id };
        const { result } = await implementation.database.get(key);
        if (!result)
          throw new NotFoundError(`Game "${game.name}(${game.id})" does not have terrainProp "${id}"`);
        await implementation.database.remove(key);
        if (implementation.onUpdate)
          await implementation.onUpdate(result, null);
        return result;
      }
    });
  }

  return {
    createGameResourceRoutes,
    createDynamoDBGameResourceRoute,
  }
};
