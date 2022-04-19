// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Cast } from "@lukekaalim/cast/main"; */

import { c, castEnum } from "@lukekaalim/cast"; 
import { castUserId } from '@astral-atlas/sesame-models';


/*::
export type GameID = string;
*/
export const castGameId/*: Cast<GameID>*/ = c.str;

/*::
export type Player = {
  type: 'player',
  name: string,
  userId: UserID,
  gameId: GameID,
};
export type GameMaster = {
  type: 'game-master',
  name: string,
  userId: UserID,
  gameId: GameID,
}
*/
export const castPlayer/*: Cast<Player>*/ = c.obj({
  type: c.lit('player'),
  name: c.str,
  userId: castUserId,
  gameId: castGameId
})
export const castGameMaster/*: Cast<GameMaster>*/ = c.obj({
  type: c.lit('game-master'),
  name: c.str,
  userId: castUserId,
  gameId: castGameId
})

/*::
export type Game = {
  id: GameID,
  name: string,
  gameMasterId: UserID,
};
*/

export const castGame/*: Cast<Game>*/ = c.obj({
  id: castGameId,
  name: c.str,
  gameMasterId: castUserId,
});

/*::
export type GameUpdate =
  | {| type: 'players' |}
  | {| type: 'characters' |}
  | {| type: 'rooms' |}
  | {| type: 'tracks' |}
  | {| type: 'playlists' |}
  | {| type: 'encounters' |}
  | {| type: 'locations' |}
  | {| type: 'non-player-characters' |}
  | {| type: 'scenes' |}
*/


export const castGameUpdate/*: Cast<GameUpdate>*/ = c.or('type', {
  'players':    c.obj({ type: (c.lit('players')/*: Cast<'players'>*/) }),
  'characters': c.obj({ type: (c.lit('characters')/*: Cast<'characters'>*/)}),
  'rooms':      c.obj({ type: (c.lit('rooms')/*: Cast<'rooms'>*/)}),
  'tracks':     c.obj({ type: (c.lit('tracks')/*: Cast<'tracks'>*/)}),
  'playlists':  c.obj({ type: (c.lit('playlists')/*: Cast<'playlists'>*/)}),
  'encounters': c.obj({ type: (c.lit('encounters')/*: Cast<'encounters'>*/)}),

  'locations':              c.obj({ type: c.lit('locations') }),
  'non-player-characters':  c.obj({ type: c.lit('non-player-characters') }),
  'scenes':                 c.obj({ type: c.lit('scenes') }),
});

export * from './game/index.js'