// @flow strict
/*:: import type { AccessOptions, CacheOptions, RequestHandler, ResourceResponse, ResourceRequest, Route } from '@lukekaalim/http-server'; */
/*:: import type { ResourceDescription, ResourceMethod, Resource } from '@lukekaalim/net-description'; */
/*:: import type { GameID, Game } from '@astral-atlas/wildspace-models'; */

/*:: import type { Identity } from "../services/auth.js"; */
/*:: import type { GameIdentityScope } from "../services/game.js"; */
/*:: import type { Services } from "../services.js"; */
import { createJSONResourceRoutes } from '@lukekaalim/http-server';

export const defaultOptions/*: {| access?: AccessOptions, cache?: CacheOptions |} */ = {
  access: {
    origins: { type: 'wildcard' },
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    cache: 600,
    headers: ['content-type', 'authorization']
  },
};

/*::
export type AuthorizedResourceMethod <T: ResourceMethod<>> = {
  scope: GameIdentityScope,
  getGameId: ResourceRequest<T['query'], T['request']> => GameID,
  handler: (
    request: { ...ResourceRequest<T['query'], T['request']>, game: Game, identity: Identity }
  ) => 
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

export type MetaRoutes = {
  createAuthorizedResource: AuthorizedResourceConstructor
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

  return { createAuthorizedResource }
};
