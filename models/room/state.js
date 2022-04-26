// @flow strict

import { c } from "@lukekaalim/cast";
import { castGameUpdate } from "../game.js";
import { castRoomAudioState } from "./audio.js";
import { castRoomSceneState } from "./scene.js";
import { castEncounterState } from "../encounter.js";
import { castRoomLobbyEvent, castRoomLobbyState } from "./lobby.js";
import { reduceLobbyState } from "./lobby.js";

/*::
import type { EncounterState } from "../encounter";
import type { GameUpdate } from "../game";
import type { RoomAudioState } from "./audio";
import type { RoomLobbyEvent, RoomLobbyState } from "./lobby";
import type { RoomSceneState } from "./scene";
import type { Cast } from "@lukekaalim/cast";
import type { RoomState } from "../room";
*/

/*::
export type RoomStateEvent =
  | {| type: 'game',         game: GameUpdate |}
  | {| type: 'audio',        audio: RoomAudioState |}
  | {| type: 'scene',        scene: RoomSceneState |}
  | {| type: 'encounter',    encounter: ?EncounterState |}
  | {| type: 'lobby',        lobby: RoomLobbyState |}
  | {| type: 'lobby-event',  lobbyEvent: RoomLobbyEvent |}

*/


export const castRoomStateEvent/*: Cast<RoomStateEvent>*/ = c.or('type', {
  'game':         c.obj({ type: c.lit('game'),         game:        castGameUpdate }),
  'audio':        c.obj({ type: c.lit('audio'),        audio:       castRoomAudioState }),
  'scene':        c.obj({ type: c.lit('scene'),        scene:       castRoomSceneState }),
  'encounter':    c.obj({ type: c.lit('encounter'),    encounter:   c.maybe(castEncounterState) }),
  'lobby':        c.obj({ type: c.lit('lobby'),        lobby:       castRoomLobbyState }),
  'lobby-event':  c.obj({ type: c.lit('lobby-event'),  lobbyEvent:  castRoomLobbyEvent }),
})

export const reduceRoomState = (state/*: RoomState*/, event/*: RoomStateEvent*/)/*: RoomState*/ => {
  switch (event.type) {
    case 'audio':
      return { ...state, audio: event.audio };
    case 'lobby-event':
      const nextLobby = reduceLobbyState(state.lobby, event.lobbyEvent);
      return nextLobby === state.lobby ? state : { ...state, lobby: nextLobby };
    case 'scene':
      return { ...state, scene: event.scene } 
    default:
      return state;
  }
}