// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description"; */
/*:: import type { GameID, Game, GameMaster, Player } from '../../game.js'; */
/*:: import type { CharacterID, MonsterID, Character, Monster } from '../../character.js'; */

import {
  createObjectCaster as obj, castString as str,
  createConstantCaster as lit, createArrayCaster as arr,
  createNullableCaster as maybe,
  c,
} from '@lukekaalim/cast';
import { castGameId, castGame } from '../../game.js';
import { castCharacter, castCharacterId } from '../../character.js';
import { castUserId } from '@astral-atlas/sesame-models';
import { castGameMaster, castPlayer } from "../../game.js";

/*::
export type CharactersAPI = {|
  '/games/characters': {|
    GET: {
      query: { gameId: GameID },
      request: empty,
      response: { type: 'found', characters: $ReadOnlyArray<Character> },
    },
    POST: {
      query: empty,
      request: { gameId: GameID, playerId: UserID, name: string },
      response: { type: 'created', character: Character },
    },
    PUT: {
      query: { gameId: GameID, characterId: CharacterID },
      request: { character: Character },
      response: { type: 'updated' },
    },
    DELETE: {
      query: { gameId: GameID, characterId: CharacterID },
      request: empty,
      response: { type: 'deleted' },
    }
  |},
|};
*/

export const gameCharactersResourceDescription/*: ResourceDescription<CharactersAPI['/games/characters']>*/ = {
  path: '/games/characters',

  GET: {
    toQuery: c.obj({ gameId: castGameId }),
    toResponseBody: obj({ type: lit('found'), characters: c.arr(castCharacter) }),
  },
  POST: {
    toRequestBody: c.obj({ gameId: castGameId, name: c.str, playerId: castUserId }),
    toResponseBody: obj({ type: lit('created'), character: castCharacter }),
  },
  PUT: {
    toQuery: c.obj({ gameId: castGameId, characterId: castCharacterId }),
    toRequestBody: c.obj({ character: castCharacter }),
    toResponseBody: obj({ type: lit('updated') }),
  },
  DELETE: {
    toQuery: c.obj({ gameId: castGameId, characterId: castCharacterId }),
    toResponseBody: obj({ type: lit('deleted') }),
  },
};

export const charactersAPI = {
  '/games/characters': gameCharactersResourceDescription,
};
