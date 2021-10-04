// @flow strict
/*:: import type { ResourceDescription } from "@lukekaalim/net-description"; */
/*:: import type { GameID, Game } from '../game.js'; */
/*:: import type { CharacterID, MonsterID, Character, Monster } from '../character.js'; */

import {
  createObjectCaster as obj, castString as str,
  createConstantCaster as lit, createArrayCaster as arr
} from '@lukekaalim/cast';
import { castGameId, castGame } from '../game.js';
import { castCharacter } from '../character.js';

/*::
export type GameAPI = {
  '/game': {|
    GET: {
      query: { gameId: GameID },
      request: empty,
      response: { type: 'found', game: Game, characters: $ReadOnlyArray<Character> },
    },
  |},
};
*/

export const gameResourceDescription/*: ResourceDescription<GameAPI['/game']>*/ = {
  path: '/users',

  GET: {
    toQuery: obj({ gameId: castGameId }),
    toResponseBody: obj({ type: lit('found'), game: castGame, characters: arr(castCharacter) }),
  },
};
