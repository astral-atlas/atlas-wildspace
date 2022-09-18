// @flow strict
/*::
import type { AdvancedGameCRUDAPI } from "./meta";
import type { ResourceDescription } from "@lukekaalim/net-description";
import type { InitativeID, Initiative } from "../../game/initiative";
import type { GameID } from "../../game/game";
import type { CharacterID, MonsterID } from "../../character";
import type {
  Piece,
  MiniTheater,
  MiniTheaterAction,
  MiniTheaterID,
} from "../../game/miniTheater";
import type { BoxBoardArea } from "../../encounter/board";
import type { BoardPosition } from "../../encounter/map";
import type { TerrainAPI } from "./miniTheater/terrain";
*/

import { c } from "@lukekaalim/cast";
import { createAdvancedCRUDGameAPI } from "./meta.js";
import { castBoardPosition } from "../../encounter/map.js";
import {
  castMiniTheaterId,
  castMiniTheater,
  castMiniTheaterAction,
} from "../../game/miniTheater.js";
import { castCharacterId, castMonsterId } from "../../character.js";
import { castGameId } from "../../game/game.js";
import { castPiece } from "../../game/miniTheater.js";
import { castBoxBoardArea } from "../../game/miniTheater.js";
import { terrainAPI } from "./miniTheater/terrain.js";

/*::
type MiniTheaterResource = AdvancedGameCRUDAPI<{|
  resource: MiniTheater,
  resourceName: 'miniTheater',
  resourceId: MiniTheaterID,
  resourceIdName: 'miniTheaterId',

  resourcePostInput: { name: string },
  resourcePutInput: { name: ?string, pieces: ?$ReadOnlyArray<Piece>, baseArea: ?BoxBoardArea },
|}>
type MiniTheaterActionResource = {|
  POST: {
    query: { gameId: GameID, miniTheaterId: MiniTheaterID },
    request: { action: MiniTheaterAction },
    response: { type: 'updated' }
  }
|}
type MiniTheaterByIDResource = {|
  GET: {
    query: { gameId: GameID, miniTheaterId: MiniTheaterID },
    request: empty,
    response: { type: 'found', miniTheater: MiniTheater }
  }
|}

export type MiniTheaterAPI = {|
  '/mini-theater': MiniTheaterResource,
  '/mini-theater/id': MiniTheaterByIDResource,
  '/mini-theater/action': MiniTheaterActionResource,
  ...TerrainAPI,
|}
*/

const miniTheater/*: ResourceDescription<MiniTheaterResource>*/ = createAdvancedCRUDGameAPI({
  path: '/mini-theater',
  castResource: castMiniTheater,
  castResourceId: castMiniTheaterId,
  resourceName: 'miniTheater',
  resourceIdName: 'miniTheaterId',
  castPostResource: c.obj({ name: c.str }),
  castPutResource: c.obj({
    name: c.maybe(c.str),
    pieces: c.maybe(c.arr(castPiece)),
    baseArea: c.maybe(castBoxBoardArea)
  }),
});

const miniTheaterAction/*: ResourceDescription<MiniTheaterActionResource>*/ = {
  path: '/mini-theater/action',
  POST: {
    toQuery: c.obj({ gameId: castGameId, miniTheaterId: castMiniTheaterId }),
    toRequestBody: c.obj({ action: castMiniTheaterAction }),
    toResponseBody: c.obj({ type: c.lit('updated') })
  }
}
const miniTheaterById/*: ResourceDescription<MiniTheaterByIDResource>*/ = {
  path: '/mini-theater/id',
  GET: {
    toQuery: c.obj({ gameId: castGameId, miniTheaterId: castMiniTheaterId }),
    toResponseBody: c.obj({ type: c.lit('found'), miniTheater: castMiniTheater })
  }
}

export const miniTheaterAPI = {
  '/mini-theater': miniTheater,
  '/mini-theater/id': miniTheaterById,
  '/mini-theater/action': miniTheaterAction,
  ...terrainAPI,
};
