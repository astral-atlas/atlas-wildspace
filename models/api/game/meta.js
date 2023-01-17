// @flow strict

/*::
import type { Cast } from '@lukekaalim/cast';
import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description";
import type { GameMetaResource, Version } from "../../game/meta";
import type { GamePermission } from "../../game/permission";
import type { TagID } from "../../game/tag";

import type {
  GameID, Game,
} from '../../game.js';
import type {
  AssetID, AssetDescription, AssetInfo, AssetInfoDatabase
} from '../../asset.js';
*/
import { c } from '@lukekaalim/cast';
import { castGameId } from '../../game.js';
import { castAssetInfoDatabase } from "../../asset.js";
import { castGameMetaResource } from "../../game/meta.js";
import { castTagId } from "../../game/tag.js";
import { castGamePermission } from "../../game/permission.js";

/*::
export type CRUDGameAPI<Resource, ResourceName: string, ResourceID: string> = {|
  GET: {
    query: { gameId: GameID },
    request: empty,
    response: {
      type: 'found', [ResourceName]: $ReadOnlyArray<Resource>,
      relatedAssets: AssetInfoDatabase
    },
  },
  POST: {
    query: empty,
    request: { gameId: GameID },
    response: { type: 'created', [ResourceName]: Resource },
  },
  PUT: {
    query: { gameId: GameID, [ResourceName]: ResourceID },
    request: { [ResourceName]: Resource },
    response: { type: 'updated' },
  },
  DELETE: {
    query: { gameId: GameID, [ResourceName]: ResourceID },
    request: empty,
    response: { type: 'deleted' },
  },
  PATCH: any,
|}
*/

export const createCRUDGameAPI = /*:: <Resource, ResourceName: string, ResourceID: string>*/(
  path/*: string*/,
  name/*: ResourceName*/,
  castResource/*: Cast<Resource>*/,
  castResourceId/*: Cast<ResourceID>*/,
)/*: ResourceDescription<CRUDGameAPI<Resource,ResourceName, ResourceID>>*/ => {
  return {
    path,

    GET: {
      toQuery: c.obj({ gameId: castGameId }),
      toResponseBody: c.obj({
        type: c.lit('found'),
        [name]: c.arr(castResource),
        relatedAssets: castAssetInfoDatabase,
      }),
    },
    POST: {
      toRequestBody: c.obj({ gameId: castGameId }),
      toResponseBody: c.obj({ type: c.lit('created'), [name]: castResource }),
    },
    PUT: {
      toQuery: c.obj({ gameId: castGameId, [name]: castResourceId }),
      toRequestBody: c.obj({ [name]: castResource }),
      toResponseBody: c.obj({ type: c.lit('updated') }),
    },
    DELETE: {
      toQuery: c.obj({ gameId: castGameId, [name]: castResourceId }),
      toResponseBody: c.obj({ type: c.lit('deleted') }),
    },
  }
};


/*::
export type AdvancedGameCRUDAPIDescription = {
  resource: any,
  resourceName: any,
  resourceId: any,
  resourceIdName: any,

  resourcePostInput: any,
  resourcePutInput: any,
}
export type DeriveGameCRUDDescription<T> = $Call<<A>(a: AdvancedGameCRUDAPI<A>) => A, T>;

export type AdvancedGameCRUDAPIConstructorInput<T: AdvancedGameCRUDAPIDescription> = {
  path: string,

  castResource: Cast<T["resource"]>,
  resourceName: T["resourceName"],
  resourceIdName: T["resourceIdName"],

  castPostResource: Cast<T["resourcePostInput"]>,
  castPutResource: Cast<T["resourcePutInput"]>,
}

export type AdvancedGameCRUDAPI<T: AdvancedGameCRUDAPIDescription> = {|
  GET: {
    query: { gameId: GameID },
    request: empty,
    response: {
      type: 'found',
      [T["resourceName"]]: $ReadOnlyArray<T["resource"]>,
      relatedAssets: AssetInfoDatabase,
    },
  },
  POST: {
    query: empty,
    request: { gameId: GameID, [T["resourceName"]]: T["resourcePostInput"] },
    response: { type: 'created', [T["resourceName"]]: T["resource"] },
  },
  PUT: {
    query: { gameId: GameID, [T["resourceIdName"]]: T["resourceId"] },
    request: { [T["resourceName"]]: T["resourcePutInput"] },
    response: { type: 'updated' },
  },
  DELETE: {
    query: { gameId: GameID, [T["resourceIdName"]]: T["resourceId"] },
    request: empty,
    response: { type: 'deleted' },
  },
  PATCH: any,
|}
*/

export const createAdvancedCRUDGameAPI = /*:: <T: AdvancedGameCRUDAPIDescription>*/({
  path,
  castResource,
  resourceName,
  resourceIdName,
  castPostResource,
  castPutResource,
}/*: AdvancedGameCRUDAPIConstructorInput<T>*/)/*: ResourceDescription<AdvancedGameCRUDAPI<T>>*/ => {
  return {
    path,

    GET: {
      toQuery: c.obj({ gameId: castGameId }),
      toResponseBody: c.obj({
        type: c.lit('found'),
        [resourceName]: c.arr(castResource),
        relatedAssets: castAssetInfoDatabase,
      }),
    },
    POST: {
      toRequestBody: c.obj({ gameId: castGameId, [resourceName]: castPostResource }),
      toResponseBody: c.obj({ type: c.lit('created') }),
    },
    PUT: {
      toQuery: c.obj({ gameId: castGameId, [resourceIdName]: c.str }),
      toRequestBody: c.obj({ [resourceName]: castPutResource }),
      toResponseBody: c.obj({ type: c.lit('updated') }),
    },
    DELETE: {
      toQuery: c.obj({ gameId: castGameId, [resourceIdName]: c.str }),
      toResponseBody: c.obj({ type: c.lit('deleted') }),
    },
  }
};


export * from './meta/gameResource.js';