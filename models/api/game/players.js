// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description"; */
/*:: import type { GameID, Game, GameMaster, Player } from '../../game.js'; */
/*:: import type { CharacterID, MonsterID, Character, Monster } from '../../character.js'; */

import { c } from '@lukekaalim/cast';
import { castGameId, castGameMaster, castPlayer  } from '../../game.js';
import { castCharacter, castCharacterId } from '../../character.js';
import { castUserId } from '@astral-atlas/sesame-models';

/*::
export type PlayersAPI = {|
  '/games/players': {|
    GET: {
      query: { gameId: GameID },
      request: empty,
      response: { type: 'found', players: $ReadOnlyArray<Player> },
    },
    POST: {
      query: empty,
      request: { gameId: GameID, playerId: UserID },
      response: { type: 'joined' },
    },
    DELETE: {
      query: { gameId: GameID, playerId: UserID },
      request: empty,
      response: { type: 'removed' },
    }
  |},
|};
*/

export const playersDescription/*: ResourceDescription<PlayersAPI['/games/players']>*/ = {
  path: '/games/players',

  GET: {
    toQuery: c.obj({ gameId: castGameId }),
    toResponseBody: c.obj({ type: c.lit('found'), players: c.arr(castPlayer) }),
  },
  POST: {
    toRequestBody: c.obj({ gameId: castGameId, playerId: castUserId }),
    toResponseBody: c.obj({ type: c.lit('joined') }),
  },
  DELETE: {
    toQuery: c.obj({ gameId: castGameId, playerId: castUserId }),
    toResponseBody: c.obj({ type: c.lit('removed') }),
  },
};

export const playersAPI = {
  '/games/players': playersDescription,
};
