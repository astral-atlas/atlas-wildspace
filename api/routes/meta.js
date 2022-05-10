// @flow strict
/*:: import type { AccessOptions, CacheOptions, RequestHandler, ResourceResponse, ResourceRequest, Route } from '@lukekaalim/http-server'; */
/*:: import type {
  ResourceDescription, ResourceMethod, Resource,
  
  Connection, ConnectionDescription
} from '@lukekaalim/net-description'; */
/*:: import type { GameID, Game, RoomID, Room } from '@astral-atlas/wildspace-models'; */
/*::
import type { WebSocketRoute, ClientConnection, } from "@lukekaalim/ws-server";
import type { WebSocket } from "ws";
import type { AuthorizedConnection } from '@astral-atlas/wildspace-models'
import type { LinkGrant } from "@astral-atlas/sesame-models";

import type {
  AdvancedGameCRUDAPI,
  AdvancedGameCRUDAPIDescription,
  GameUpdate,
} from "@astral-atlas/wildspace-models";
*/

/*:: import type { Identity } from "../services/auth.js"; */
/*:: import type { GameIdentityScope } from "../services/game.js"; */
/*:: import type { Services } from "../services.js"; */
import { createJSONResourceRoutes } from '@lukekaalim/http-server';
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { createJSONConnectionRoute } from '@lukekaalim/ws-server';

export const defaultOptions/*: {| access?: AccessOptions, cache?: CacheOptions |} */ = {
  access: {
    origins: { type: 'wildcard' },
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    cache: 600,
    headers: ['content-type', 'authorization']
  },
};

/*::
export type Awaitable<T> =
  | T
  | Promise<T>

export type GameResourceRequest<T: ResourceMethod<>> = {
  ...ResourceRequest<T['query'], T['request']>,
  game: Game,
  identity: Identity
}

export type AuthorizedResourceMethod <T: ResourceMethod<>> = {
  scope: GameIdentityScope,
  getGameId: ResourceRequest<T['query'], T['request']> => GameID,
  handler: (request: GameResourceRequest<T>) => 
    | ResourceResponse<T['response']>
    | Promise<ResourceResponse<T['response']>>
};

export type AuthorizedImplementation<T> = {|
  access?: AccessOptions,
  cache?: CacheOptions,

  GET?:     AuthorizedResourceMethod<T['GET']>,
  POST?:    AuthorizedResourceMethod<T['POST']>,
  DELETE?:  AuthorizedResourceMethod<T['DELETE']>,
  PUT?:     AuthorizedResourceMethod<T['PUT']>,
  PATCH?:   AuthorizedResourceMethod<T['PATCH']>,
|}

export type AuthorizedResourceConstructor = <T: Resource>(description: ResourceDescription<T>, implementation: AuthorizedImplementation<T>) => Route[];


export type RoomResourceRequest<T: ResourceMethod<>> = {
  ...GameResourceRequest<T>,
  room: Room
}
export type RoomMethod<T: ResourceMethod<>> = {
  ...AuthorizedResourceMethod<T>,
  getRoomId: ResourceRequest<T['query'], T['request']> => RoomID,
  handler: (request: RoomResourceRequest<T>) => 
    | ResourceResponse<T['response']>
    | Promise<ResourceResponse<T['response']>>
}
export type RoomResourceImplementation<T> = {|
  ...AuthorizedImplementation<T>,

  GET?:     RoomMethod<T['GET']>,
  POST?:    RoomMethod<T['POST']>,
  DELETE?:  RoomMethod<T['DELETE']>,
  PUT?:     RoomMethod<T['PUT']>,
  PATCH?:   RoomMethod<T['PATCH']>,
|};
export type RoomResourceConstructor = <T: Resource>(
  description: ResourceDescription<T>,
  implementation: RoomResourceImplementation<T>
) => Route[];

export type GameConnectionImplementation<T> = {|
  getGameId: T['query'] => GameID,
  scope: GameIdentityScope,
  handler: ({
    connection: ClientConnection<T>,
    socket: WebSocket,
    game: Game,
    identity: { type: 'link', grant: LinkGrant },
  }) => mixed
|};

export type GameConnectionConstructor = <T: Connection<>>(
  description: ConnectionDescription<AuthorizedConnection<T>>,
  implementation: GameConnectionImplementation<T>
) => WebSocketRoute;

export type MetaRoutes = {
  createAuthorizedResource: AuthorizedResourceConstructor,
  createRoomResource: RoomResourceConstructor,
  createGameConnection: GameConnectionConstructor
};
*/

export const createMetaRoutes = (services/*: Services*/)/*: MetaRoutes*/ => {

  const createAuthorizedResource = /*:: <T: Resource>*/(
    description/*:  ResourceDescription<T>*/,
    implementation/*:  AuthorizedImplementation<T>*/,
  )/*: Route[]*/ => {
    const createAuthorizedResourceHandler = ({ scope, getGameId, handler }) => {
      const { assertWithinScope } = services.game.createScopeAssertion(scope)
      const requestHandler = async (request) => {
        const { query, headers: { authorization } } = request;
        const id = getGameId(request);
    
        const identity = await services.auth.getAuthFromHeader(authorization);
  
        const { game } = await assertWithinScope(id, identity);
  
        const response = await handler({ ...request, game, identity });
        return response;
      };
      return requestHandler;
    }

    return createJSONResourceRoutes(description, {
      ...defaultOptions,
      access: implementation.access || defaultOptions.access,
      cache: implementation.cache || defaultOptions.cache,

      GET: implementation.GET && createAuthorizedResourceHandler(implementation.GET),
      POST: implementation.POST && createAuthorizedResourceHandler(implementation.POST),
      PUT: implementation.PUT && createAuthorizedResourceHandler(implementation.PUT),
      DELETE: implementation.DELETE && createAuthorizedResourceHandler(implementation.DELETE),
      PATCH: implementation.PATCH && createAuthorizedResourceHandler(implementation.PATCH),
    });
  };


  const createRoomResource = /*:: <T: Resource>*/(
    description/*:  ResourceDescription<T>*/,
    implementation/*:  RoomResourceImplementation<T>*/,
  ) => {
    const wrapHandler = (getRoomId, roomHandler) => {
      const wrappedHandler = async (request) => {
        const roomId = getRoomId(request);
        try {
          const { result: room } = await services.data.room.get(request.game.id, roomId)
          if (!room)
            throw new Error();
          return roomHandler({ ...request, room });
        } catch (error) {
          return { status: HTTP_STATUS.not_found };
        }
      }
      return wrappedHandler;
    };
    const wrapImplementaion = ({ scope, getGameId, getRoomId, handler }) => {
      return {
        scope,
        getGameId,
        handler: wrapHandler(getRoomId, handler)
      }
    }

    return createAuthorizedResource(description, {
      GET: implementation.GET && wrapImplementaion(implementation.GET),
      POST: implementation.POST && wrapImplementaion(implementation.POST),
      PUT: implementation.PUT && wrapImplementaion(implementation.PUT),
      DELETE: implementation.DELETE && wrapImplementaion(implementation.DELETE),
      PATCH: implementation.PATCH && wrapImplementaion(implementation.PATCH),
    })
  };

  const createGameConnection = /*:: <T: Connection<>>*/(
    description/*: ConnectionDescription<AuthorizedConnection<T>>*/,
    implementation/*: GameConnectionImplementation<T>*/ 
  ) => {
    const { assertWithinScope } = services.game.createScopeAssertion(implementation.scope)

    const handler = async (connection, socket, request) => {
      const listeners = new Set();
      const wrappedConnection = {
        ...connection,
        addRecieveListener: (listener) => {
          listeners.add(listener);
          return { removeListener: () => void listeners.delete(listener) };
        }
      }
      const onAuthenticate = async (message) => {
        const grant = await services.auth.sdk.validateProof(message.proof);
        if (!grant)
          return socket.close(1000, 'Bad Auth');
        const identity = { type: 'link', grant };
          
        const gameId = implementation.getGameId(connection.query);
        const { game } = await assertWithinScope(gameId, identity);
        implementation.handler({
          connection: wrappedConnection,
          game,
          identity,
          socket,
        })
      };
      connection.addRecieveListener(message => {
        if (message.type === 'proof') {
          onAuthenticate(message);
        } else {
          for (const listener of listeners)
            listener(message)
        }
      })
    }
    return createJSONConnectionRoute(description, (c, s, r) => void handler(c, s, r))
  }

  return { createAuthorizedResource, createRoomResource, createGameConnection }
};

/*::
export type GameCRUDResourceRequest<T: AdvancedGameCRUDAPIDescription, M> = {
  ...GameResourceRequest<AdvancedGameCRUDAPI<T>[M]>,
  grant: LinkGrant,
}
export type GameCRUDResourceImplementation<T: AdvancedGameCRUDAPIDescription> = {
  name: T["resourceName"],
  idName: T["resourceIdName"],

  create: (request: GameCRUDResourceRequest<T, "POST">, input: T["resourcePostInput"]) => Awaitable<T["resource"]>,
  read:   (request: GameCRUDResourceRequest<T, "GET">) => Awaitable<T["resource"][]>,
  update: (request: GameCRUDResourceRequest<T, "PUT">, id: T["resourceId"], input: T["resourcePutInput"]) => Awaitable<T["resource"]>,
  destroy: (request: GameCRUDResourceRequest<T, "DELETE">, id: T["resourceId"]) => Awaitable<void>,

  gameUpdateType?: GameUpdate["type"],
}

export type CRUDConstructors = {
  createGameCRUDRoutes: <T: AdvancedGameCRUDAPIDescription>(
    resource: ResourceDescription<AdvancedGameCRUDAPI<T>>,
    implementation: GameCRUDResourceImplementation<T>
  ) => Route[],
}
*/

export const createCRUDConstructors = (services/*: Services*/)/*: CRUDConstructors*/ => {
  const { createAuthorizedResource } = createMetaRoutes(services);

  const createGameCRUDRoutes = /*:: <T: AdvancedGameCRUDAPIDescription>*/(
    resource/*: ResourceDescription<AdvancedGameCRUDAPI<T>>*/,
    implementation/*: GameCRUDResourceImplementation<T>*/,
  ) => {
    return createAuthorizedResource(resource, {
      GET: {
        scope: { type: 'player-in-game' },
        getGameId: r => r.query.gameId,
        async handler(request) {
          if (request.identity.type === 'guest')
            return { status: HTTP_STATUS.unauthorized };
          const { grant } = request.identity;
          const resources = await implementation.read({ ...request, grant });

          return { status: HTTP_STATUS.ok, body: { type: 'found', [implementation.name]: resources, relatedAssets: [] } }
        }
      },
      POST: {
        scope: { type: 'game-master-in-game' },
        getGameId: r => r.body.gameId,
        async handler(request) {
          if (request.identity.type === 'guest')
            return { status: HTTP_STATUS.unauthorized };
          const { grant } = request.identity;
          console.log(request.body);
          const resource = await implementation.create({ ...request, grant }, request.body[implementation.name] );

          if (implementation.gameUpdateType)
            services.data.gameUpdates.publish(request.game.id, { type: implementation.gameUpdateType });

          return { status: HTTP_STATUS.ok, body: { type: 'created', [implementation.name]: resource } }
        }
      },
      PUT: {
        scope: { type: 'game-master-in-game' },
        getGameId: r => r.query.gameId,
        async handler(request) {
          if (request.identity.type === 'guest')
            return { status: HTTP_STATUS.unauthorized };
          const { grant } = request.identity;
          const resourceId = request.query[implementation.idName];
          const resourceInput = request.body[implementation.name];
          const resource = await implementation.update({ ...request, grant }, resourceId, resourceInput);
          
          if (implementation.gameUpdateType)
            services.data.gameUpdates.publish(request.game.id, { type: implementation.gameUpdateType });

          return { status: HTTP_STATUS.ok, body: { type: 'updated', [implementation.name]: resource } }
        }
      },
    })
  }

  return {
    createGameCRUDRoutes,
  }
}