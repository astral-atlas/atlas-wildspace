// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { ResourceDescription } from "@lukekaalim/net-description"; */
/*:: import type { GameID, Game } from '../game.js'; */
/*:: import type { CharacterID, MonsterID, Character, Monster } from '../character.js'; */

import {
  createObjectCaster as obj, castString as str,
  createConstantCaster as lit, createArrayCaster as arr,
  createNullableCaster as maybe,
} from '@lukekaalim/cast';
import { castGameId, castGame } from '../game.js';
import { castCharacter } from '../character.js';
import { castUserId } from '@astral-atlas/sesame-models';

/*::
export type GameAPI = {
  '/games': {|
    GET: {
      query: { gameId: GameID },
      request: empty,
      response: { type: 'found', game: Game },
    },
    POST: {
      query: empty,
      request: { name: string, playerIds: $ReadOnlyArray<UserID> },
      response: { type: 'created', game: Game },
    },
    PUT: {
      query: { gameId: GameID },
      request: { name: ?string, playerIds: ?$ReadOnlyArray<UserID> },
      response: { type: 'updated' },
    }
  |},
  '/games/join': {|
    POST: {
      query: empty,
      request: { gameId: GameID },
      response: { type: 'joined' },
    }
  |},
  '/games/all': {|
    GET: {
      query: empty,
      request: empty,
      response: { type: 'found', games: $ReadOnlyArray<Game> },
    },
  |},
};
*/

export const gameResourceDescription/*: ResourceDescription<GameAPI['/games']>*/ = {
  path: '/games',

  GET: {
    toQuery: obj({ gameId: castGameId }),
    toResponseBody: obj({ type: lit('found'), game: castGame }),
  },
  POST: {
    toRequestBody: obj({ name: str, playerIds: arr(castUserId) }),
    toResponseBody: obj({ type: lit('created'), game: castGame }),
  },
  PUT: {
    toQuery: obj({ gameId: castGameId }),
    toRequestBody: obj({ name: maybe(str), playerIds: maybe(arr(castUserId)) }),
    toResponseBody: obj({ type: lit('updated') }),
  },
};

export const joinGameResourceDescription/*: ResourceDescription<GameAPI['/games/join']>*/ = {
  path: '/games/join',

  POST: {
    toRequestBody: obj({ gameId: castGameId }),
    toResponseBody: obj({ type: lit('joined') }),
  },
};

export const allGamesResourceDescription/*: ResourceDescription<GameAPI['/games/all']>*/ = {
  path: '/games/all',

  GET: {
    toResponseBody: obj({ type: lit('found'), games: arr(castGame) }),
  },
};

export const gameAPI = {
  '/games': gameResourceDescription,
  '/games/all': allGamesResourceDescription,
  '/games/join': joinGameResourceDescription,
}