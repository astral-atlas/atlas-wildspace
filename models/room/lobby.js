// @flow strict

import { castUserId } from "@astral-atlas/sesame-models";
import { c } from "@lukekaalim/cast";
import { castCharacterId } from "../character.js";
import { castGameConnectionId } from "../game/connection.js";


/*.doc
## Lobby

The lobby exposes more of the "connection" of different players and
users to an individual client 
*/

/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type { Cast } from "@lukekaalim/cast";
import type { CharacterID } from "../character.js";
import type { WikiDocID } from "../game";
import type { GameConnectionID } from "../game/connection";

export type RoomLobbyEvent =
  | {| type: 'append-messages', messages: $ReadOnlyArray<LobbyMessage> |}
  | {| type: 'connection', playersConnected: $ReadOnlyArray<LobbyConnection> |}

export type LobbyMessageID = string;
export type LobbyMessage = {
  id: LobbyMessageID,
  timePosted: number,

  content: LobbyMessageContent
};
export type LobbyMessageContent =
  | { type: 'user', userId: UserID, node: LobbyMessageNode }
  | { type: 'character', characterId: CharacterID, node: LobbyMessageNode }

export type LobbyMessageNode =
  | { type: 'plaintext', plaintext: string }

export type LobbyConnection = {
  gameConnectionId: GameConnectionID,
  userId: UserID,
}
export type RoomLobbyState = {
  playersConnected: $ReadOnlyArray<LobbyConnection>,
  messages: $ReadOnlyArray<LobbyMessage>,
};
*/
export const castLobbyMessageNode/*: Cast<LobbyMessageNode>*/ = c.or('type', {
  'plaintext': c.obj({ type: c.lit('plaintext'), plaintext: c.str })
})
export const castLobbyMessageContent/*: Cast<LobbyMessageContent>*/ = c.or('type', {
  'user': c.obj({ type: c.lit('user'), userId: castUserId, node: castLobbyMessageNode }),
  'character': c.obj({ type: c.lit('character'), characterId: castCharacterId, node: castLobbyMessageNode }),
})

export const castLobbyMessageId/*: Cast<LobbyMessageID>*/ = c.str;
export const castLobbyMessage/*: Cast<LobbyMessage>*/ = c.obj({
  id: castLobbyMessageId,
  timePosted: c.num,

  content: castLobbyMessageContent
})

export const castLobbyConnection/*: Cast<LobbyConnection>*/ = c.obj({
  gameConnectionId: castGameConnectionId,
  userId: castUserId, 
});

export const castRoomLobbyEvent/*: Cast<RoomLobbyEvent>*/ = c.or('type', {
  'connection': c.obj({ type: c.lit('connection'), playersConnected: c.arr(castLobbyConnection) }),
  'append-messages': c.obj({ type: c.lit('append-messages'), messages: c.arr(castLobbyMessage) })
})

export const castRoomLobbyState/*: Cast<RoomLobbyState>*/ = c.obj({
  playersConnected: c.arr(castLobbyConnection),
  messages: c.arr(castLobbyMessage)
})

export const reduceLobbyState = (state/*: RoomLobbyState*/, event/*: RoomLobbyEvent*/)/*: RoomLobbyState*/ => {
  switch (event.type) {
    case 'append-messages':
      return { ...state, messages: [...state.messages, ...event.messages] };
    default:
      return state;
    case 'connection':
      return { ...state, playersConnected: event.playersConnected }
  }
}