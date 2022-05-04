// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Cast } from "@lukekaalim/cast"; */

import { c } from "@lukekaalim/cast"; 
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
export type GameUpdate = {|
  type:
    | 'players'
    | 'characters'
    | 'rooms'
    | 'tracks'
    | 'playlists'
    | 'encounters'
    | 'locations'
    | 'non-player-characters'
    | 'scenes'
    | 'magicItem'
|}
*/

export const castGameUpdate/*: Cast<GameUpdate>*/ = c.obj({
  type: c.enums([
    'players',
    'characters',
    'rooms',
    'tracks',
    'playlists',
    'encounters',
    'locations',
    'non-player-characters',
    'scenes',
    'magicItem'
  ])
})