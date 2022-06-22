// @flow strict
/*::
import type { AssetInfo } from "../asset";
import type { Character, CharacterID } from "../character";
import type { MonsterActorID, MonsterActorMask } from "../monster/monsterActor";
import type { Room, RoomID } from "../room/room";
import type { Game, Player } from "./game";
import type { MagicItem } from "./magicItem";
import type { WikiDoc } from "./wiki/doc";
import type { Cast } from "@lukekaalim/cast";
import type { RoomLobbyState } from "../room/lobby";
import type { UserID } from "@astral-atlas/sesame-models/src/user";
*/
import { c } from "@lukekaalim/cast";

import { castGame } from "./game.js";
import { castCharacter, castCharacterId } from "../character.js";
import { castAssetInfo } from "../asset.js";
import { castRoom } from "../room/room.js";
import { castWikiDoc } from "./wiki/doc.js";
import { castMagicItem } from "./magicItem.js";
import { castMonsterActorMask, castMonsterActorId } from "../monster/monsterActor.js";
import { castRoomLobbyState } from "../room/lobby.js";
import { castRoomId } from "../room/room.js";
import { castPlayer } from "./game.js";
/*::
export type GamePage = {
  game: Game,

  players: $ReadOnlyArray<Player>,
  characters: $ReadOnlyArray<Character>,
  monsterMasks: $ReadOnlyArray<MonsterActorMask>,
  
  magicItems: $ReadOnlyArray<MagicItem>,
  wikiDocs: $ReadOnlyArray<WikiDoc>,

  rooms: $ReadOnlyArray<Room>,
  roomLobbies: $ReadOnlyArray<[RoomID, RoomLobbyState]>,

  assets: $ReadOnlyArray<AssetInfo>,
};
*/

export const castGamePage/*: Cast<GamePage>*/ = c.obj({
  game: castGame,

  players: c.arr(castPlayer),
  characters: c.arr(castCharacter),
  monsterMasks: c.arr(castMonsterActorMask),

  magicItems: c.arr(castMagicItem),
  wikiDocs: c.arr(castWikiDoc),

  rooms: c.arr(castRoom),
  roomLobbies: c.arr(c.tup([castRoomId, castRoomLobbyState])),

  assets: c.arr(castAssetInfo)
})

/*::
export type GamePageEvent =
  | { type: 'next-page', page: GamePage }
  | { type: 'update-lobby-state', roomId: RoomID, roomLobbyState: RoomLobbyState }
  | { type: 'update-monster-mask', monsterActorId: MonsterActorID, monsterMask: MonsterActorMask }
  | { type: 'update-character', characterId: CharacterID, character: Character }
*/
export const castGamePageEvent/*: Cast<GamePageEvent>*/ = c.or('type', {
  'next-page': c.obj({
    type: c.lit('next-page'),
    page: castGamePage
  }),
  'update-lobby-state': c.obj({
    type: c.lit('update-lobby-state'),
    roomId: castRoomId,
    roomLobbyState: castRoomLobbyState,
  }),
  'update-monster-mask': c.obj({
    type: c.lit('update-monster-mask'),
    monsterActorId: castMonsterActorId,
    monsterMask: castMonsterActorMask
  }),
  'update-character': c.obj({
    type: c.lit('update-character'),
    characterId: castCharacterId,
    character: castCharacter
  }),
})

export const reduceGamePageEvent = (page/*: GamePage*/, event/*: GamePageEvent*/)/*: GamePage*/ => {
  switch (event.type) {
    case 'next-page':
      return event.page;
    case 'update-lobby-state':
      return {
        ...page,
        roomLobbies: page.roomLobbies.map(([roomId, roomLobbyState]) => roomId === event.roomId
        ? [roomId, event.roomLobbyState]
        : [roomId, roomLobbyState])
      };
    case 'update-character':
      return {
        ...page,
        characters: page.characters.map(c => c.id === event.characterId ? event.character : c),
      }
    case 'update-monster-mask':
      return {
        ...page,
        monsterMasks: page.monsterMasks.map(m => m.id === event.monsterActorId ? event.monsterMask : m),
      }
  }
}