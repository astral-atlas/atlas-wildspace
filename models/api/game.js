// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description"; */
/*:: import type { GameID, Game, GameUpdate, GameMaster, Player } from '../game.js'; */
/*:: import type { CharacterID, MonsterID, Character, Monster } from '../character.js'; */
/*:: import type { CharactersAPI } from './game/characters.js'; */
/*:: import type { PlayersAPI } from './game/players.js'; */
/*:: import type { MonstersAPI } from "./game/monsters.js"; */
/*:: import type { EncounterAPI } from "./game/encounters.js"; */

import {
  createObjectCaster as obj, castString as str,
  createConstantCaster as lit, createArrayCaster as arr,
  createNullableCaster as maybe,
  c,
} from '@lukekaalim/cast';
import { castUserId } from '@astral-atlas/sesame-models';
import { castGameId, castGame, castGameUpdate, } from '../game.js';
import { castCharacter } from '../character.js';
import { castGameMaster, castPlayer } from "../game.js";
import { charactersAPI } from './game/characters.js';
import { playersAPI } from './game/players.js';
import { monstersAPI } from './game/monsters.js';
import { encountersAPI } from './game/encounters.js';


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
      request: { name: string },
      response: { type: 'created', game: Game },
    },
    PUT: {
      query: { gameId: GameID },
      request: { name: ?string },
      response: { type: 'updated' },
    }
  |},
  '/games/updates': {|
    query: { gameId: GameID },
    client: empty,
    server: { type: 'updated', update: GameUpdate },
  |},
  ...CharactersAPI,
  ...MonstersAPI,
  ...EncounterAPI,
  ...PlayersAPI,
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
    toRequestBody: obj({ name: str }),
    toResponseBody: obj({ type: lit('created'), game: castGame }),
  },
  PUT: {
    toQuery: obj({ gameId: castGameId }),
    toRequestBody: obj({ name: maybe(str) }),
    toResponseBody: obj({ type: lit('updated') }),
  },
};

export const roomStateConnectionDescription/*: ConnectionDescription<GameAPI['/games/updates']>*/ = {
  path: '/games/updates',
  subprotocol: 'JSON.wildspace.game_updates.v1.0.0',

  castQuery: c.obj({ gameId: castGameId }),
  castServerMessage:  c.or('type', {
    'updated': c.obj({ type: c.lit('updated'), update: castGameUpdate }),
  })
}

export const allGamesResourceDescription/*: ResourceDescription<GameAPI['/games/all']>*/ = {
  path: '/games/all',

  GET: {
    toResponseBody: obj({ type: lit('found'), games: arr(castGame) }),
  },
};

export const gameAPI = {
  ...charactersAPI,
  ...playersAPI,
  ...monstersAPI,
  ...encountersAPI,
  '/games': gameResourceDescription,
  '/games/all': allGamesResourceDescription,
  '/games/updates': roomStateConnectionDescription,
}
export * from './game/characters.js';
export * from './game/players.js';
export * from './game/monsters.js';
export * from './game/encounters.js';