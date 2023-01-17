// @flow strict

/*::
import type { Cast } from '@lukekaalim/cast';
import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description";
import type { GameMetaResource, Version } from "../../../game/meta";
import type { GamePermission } from "../../../game/permission";
import type { TagID } from "../../../game/tag";

import type {
  GameID, Game,
} from '../../../game.js';
import type {
  AssetID, AssetDescription, AssetInfo, AssetInfoDatabase
} from '../../../asset.js';
*/
import { c } from '@lukekaalim/cast';
import { castGameId } from '../../../game.js';
import { castAssetInfoDatabase } from "../../../asset.js";
import { castGameMetaResource } from "../../../game/meta.js";
import { castTagId } from "../../../game/tag.js";
import { castGamePermission } from "../../../game/permission.js";
import { spreadCast } from "../../../lib/cast.js";
import { createTypedUnionCastList } from '../../../castTypedUnion.js';

/*!md-extern
./readme.md
*/

/*::
export type GameResourceInputMetadata = {|
  title: string,
  visibility: GamePermission,
  tags: $ReadOnlyArray<TagID>,
|};
export type GameResourceDescription<+T> = {
  +resource: $ReadOnly<GameMetaResource<T, string>>,
  +input: $ReadOnly<any>,
};
export type GameResourceSpec<T: GameResourceDescription<any>> = {
  path: string,
  castResource: Cast<T["resource"]>,
  castInput: Cast<T["input"]>,
};
export type GameResourceAPIResponse<T> =
  | T
  | { type: 'permission-denied', reason: string }
  | { type: 'not-found', reason: string }
  | { type: 'invalid-input', reason: string }
  | { type: 'unknown-error', reason: string }

export type GameResourceAsResourceDescriptionInput<T: GameResourceDescription<any>> = {|
  GET: {
    query: { gameId: GameID },
    request: empty,
    response: GameResourceAPIResponse<{
      type: 'found',
      resources: $ReadOnlyArray<T["resource"]>,
    }>,
  },
  POST: {
    query: empty,
    request: { gameId: GameID, create: { ...T["input"], ...GameResourceInputMetadata } },
    response: GameResourceAPIResponse<{
      type: 'created',
      resource: T["resource"]
    }>,
  },
  PUT: {
    query: { gameId: GameID, id: T["resource"]["id"] },
    request: { update: { ...T["input"], ...GameResourceInputMetadata } },
    response: GameResourceAPIResponse<{
      type: 'updated',
      resource: T["resource"]
    }>,
  },
  DELETE: {
    query: { gameId: GameID, id: T["resource"]["id"] },
    request: empty,
    response: GameResourceAPIResponse<{
      type: 'deleted',
      resource: T["resource"]
    }>,
  },
  PATCH: any,
|}

export type GameResource<T: GameResourceDescription<any>> = {
  Description: T,
  asGameResourceSpec: GameResourceSpec<T>,
  asAPIResource: ResourceDescription<GameResourceAsResourceDescriptionInput<T>>,
};
*/

export const castGameResourceAPIResponse = /*:: <T>*/(
  castSuccess/*: Cast<T>*/,
  successKey/*: string*/
)/*: Cast<GameResourceAPIResponse<T>>*/ => {
  const castResponse = createTypedUnionCastList/*:: <any>*/([
    [successKey, (castSuccess/*: any*/)],

    ['permission-denied', c.obj({ type: c.lit('permission-denied'), reason: c.str })],
    ['not-found', c.obj({ type: c.lit('not-found'), reason: c.str })],
    ['invalid-input', c.obj({ type: c.lit('invalid-input'), reason: c.str })],
    ['unknown-error', c.obj({ type: c.lit('unknown-error'), reason: c.str })],
  ])
  return castResponse;
}

export const createStandardGameAPIDescription = /*:: <T: GameResourceDescription<any>>*/(
  { path, castInput, castResource }/*: GameResource<T>["asGameResourceSpec"]*/,
)/*: GameResource<T>["asAPIResource"]*/ => {
  return {
    path,
    GET: {
      toQuery: c.obj({
        gameId: castGameId
      }),
      toResponseBody: castGameResourceAPIResponse(c.obj({
        type: c.lit('found'),
        resources: c.arr(castResource),
      }), 'found'),
    },
    POST: {
      toRequestBody: c.obj({
        gameId: castGameId,
        id: c.str,
        create: spreadCast(castInputMetadata, castInput),
      }),
      toResponseBody: castGameResourceAPIResponse(c.obj({
        type: c.lit('created'),
        resource: castResource
      }), 'created'),
    },
    PUT: {
      toQuery: c.obj({
        gameId: castGameId,
        id: c.str
      }),
      toRequestBody: c.obj({
        update: spreadCast(castInputMetadata, castInput),
      }),
      toResponseBody: castGameResourceAPIResponse(c.obj({
        type: c.lit('updated'),
        resource: castResource
      }), 'updated'),
    },
    DELETE: {
      toQuery: c.obj({
        gameId: castGameId,
        id: c.str
      }),
      toResponseBody: castGameResourceAPIResponse(c.obj({
        type: c.lit('deleted'),
        resource: castResource
      }), 'deleted'),
    },
  }
};

const castInputMetadata/*: Cast<GameResourceInputMetadata>*/ = c.obj({
  title: c.str,
  visibility: castGamePermission,
  tags: c.arr(castTagId),
});
