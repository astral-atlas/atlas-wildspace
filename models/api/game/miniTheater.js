// @flow strict
/*::
import type { AdvancedGameCRUDAPI } from "./meta";
import type { ResourceDescription } from "@lukekaalim/net-description";
import type { InitativeID, Initiative } from "../../game/initiative";
import type { GameID } from "../../game/game";
import type { CharacterID, MonsterID } from "../../character";
import type {
  CharacterPiece,
  CharacterPieceID,
  MiniTheater,
  MiniTheaterAction,
  MiniTheaterID,
  MonsterPiece,
  MonsterPieceID,
} from "../../game/miniTheater";
import type { BoardPosition } from "../../encounter/map";
*/

import { c } from "@lukekaalim/cast";
import { createAdvancedCRUDGameAPI } from "./meta.js";
import { castBoardPosition } from "../../encounter/map.js";
import {
  castMiniTheaterId,
  castMonsterPiece,
  castMonsterPieceId,
  castMiniTheater,
  castCharacterPiece,
  castCharacterPieceId,
  castMiniTheaterAction,
} from "../../game/miniTheater.js";
import { castCharacterId, castMonsterId } from "../../character.js";
import { castGameId } from "../../game/game.js";

/*::
type MiniTheaterResource = AdvancedGameCRUDAPI<{
  resource: MiniTheater,
  resourceName: 'miniTheater',
  resourceId: MiniTheaterID,
  resourceIdName: 'miniTheaterId',

  resourcePostInput: { name: string },
  resourcePutInput: { name: string },
}>
type MiniTheaterActionResource = {
  POST: {
    query: { gameId: GameID, miniTheaterId: MiniTheaterID },
    request: { action: MiniTheaterAction },
    response: { type: 'ok' }
  }
}

export type MiniTheaterAPI = {|
  '/mini-theater': MiniTheaterResource,
  '/mini-theater/action': MiniTheaterActionResource,
|}
*/

const miniTheater/*: ResourceDescription<MiniTheaterResource>*/ = createAdvancedCRUDGameAPI({
  path: '/mini-theater',
  castResource: castMiniTheater,
  castResourceId: castMiniTheaterId,
  resourceName: 'miniTheater',
  resourceIdName: 'miniTheaterId',
  castPostResource: c.obj({ name: c.str }),
  castPutResource: c.obj({ name: c.str }),
});

const miniTheaterAction/*: ResourceDescription<MiniTheaterActionResource>*/ = {
  path: '/mini-theater/action',
  POST: {
    toQuery: c.obj({ gameId: castGameId, miniTheaterId: castMiniTheaterId }),
    toRequestBody: c.obj({ action: castMiniTheaterAction }),
    toResponseBody: c.obj({ type: c.lit('ok') })
  }
}

export const miniTheaterAPI = {
  '/mini-theater': miniTheater,
  '/mini-theater/action': miniTheaterAction,
};
