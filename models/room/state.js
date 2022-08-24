// @flow strict

import { c } from "@lukekaalim/cast";
import { castGameUpdate } from "../game.js";
import { castRoomAudioState } from "./audio.js";
import { castRoomSceneState } from "./scene.js";
import { castEncounterState } from "../encounter.js";
import { castRoomLobbyEvent, castRoomLobbyState } from "./lobby.js";
import { reduceLobbyState } from "./lobby.js";
import { castRoomId } from "./room.js";
import { castMiniTheaterId } from "../game/miniTheater.js";
import { castExpositionSubject } from "../game/exposition.js";
import { castAudioPlaylistId } from "../audio.js";

/*::
import type { Cast } from "@lukekaalim/cast";

import type { EncounterState } from "../encounter";
import type { GameUpdate } from "../game";
import type { RoomAudioState } from "./audio";
import type { RoomLobbyEvent, RoomLobbyState } from "./lobby";
import type { RoomSceneState } from "./scene";
import type { RoomID } from "./room";
import type { MiniTheaterID } from "../game/miniTheater";
import type { AudioPlaylistID } from "../audio";
import type { ExpositionSubject } from "../game/exposition";
*/

/*::
export type RoomState = {|
  roomId: RoomID,

  audio: RoomAudioState,
  scene: RoomSceneState,
  lobby: RoomLobbyState,
|};
*/

export const castRoomState/*: Cast<RoomState>*/ = c.obj({
  roomId: castRoomId,
  audio: castRoomAudioState,
  lobby: castRoomLobbyState,
  scene: castRoomSceneState,
})

/*::
export type RoomStateEvent =
  | {| type: 'game',         game: GameUpdate |}
  | {| type: 'audio',        audio: RoomAudioState |}
  | {|
      type: 'scene-mini-theater',
      miniTheaterId: MiniTheaterID,
      playlist: ?AudioPlaylistID,
      startTime: number
    |}
  | {|
      type: 'scene-exposition',
      description: string,
      subjects: $ReadOnlyArray<ExpositionSubject>,
      playlist: ?AudioPlaylistID,
      startTime: number
    |}
  | {| type: 'lobby',        lobby: RoomLobbyState |}
  | {| type: 'lobby-event',  lobbyEvent: RoomLobbyEvent |}

*/


export const castRoomStateEvent/*: Cast<RoomStateEvent>*/ = c.or('type', {
  'game':         c.obj({ type: c.lit('game'),         game:        castGameUpdate }),
  'audio':        c.obj({ type: c.lit('audio'),        audio:       castRoomAudioState }),
  'lobby':        c.obj({ type: c.lit('lobby'),        lobby:       castRoomLobbyState }),
  'lobby-event':  c.obj({ type: c.lit('lobby-event'),  lobbyEvent:  castRoomLobbyEvent }),

  'scene-mini-theater': c.obj({
    type: c.lit('scene-mini-theater'),
    miniTheaterId: castMiniTheaterId,
    startTime: c.num,
    playlist: c.maybe(castAudioPlaylistId)
  }),
  'scene-exposition': c.obj({
    type: c.lit('scene-exposition'),
    subjects: c.arr(castExpositionSubject),
    description: c.str,
    startTime: c.num,
    playlist: c.maybe(castAudioPlaylistId)
  }),
})

const reduceRoomAudioState = (state, event) => {
  switch (event.type) {
    case 'scene-exposition':
    case 'scene-mini-theater':
      const playback = event.playlist && {
        type: 'playlist',
        playlist: {
          id: event.playlist,
          mode: { type: 'playing', startTime: event.startTime }
        }
      }
      return {
        ...state,
        playback: playback || state.playback,
      };
    case 'audio':
      return event.audio;
    default:
      return state;
  }
}
const reduceRoomSceneState = (state, event) => {
  switch (event.type) {
    case 'scene-exposition':
      return {
        type: 'exposition',
        exposition: { subjects: event.subjects }
      };
    case 'scene-mini-theater':
      return {
        type: 'mini-theater',
        miniTheaterId: event.miniTheaterId,
      }
    default:
      return state;
  }
}
const reduceRoomLobbyState = (state, event) => {
  switch (event.type) {
    case 'lobby-event':
      return reduceLobbyState(state, event.lobbyEvent);
    default:
      return state;
  }
}

export const reduceRoomState = (state/*: RoomState*/, event/*: RoomStateEvent*/)/*: RoomState*/ => {
  const audio = reduceRoomAudioState(state.audio, event);
  const scene = reduceRoomSceneState(state.scene, event);
  const lobby = reduceRoomLobbyState(state.lobby, event);
  if (audio === state.audio && scene === state.scene && lobby === state.lobby)
    return state;
  return { roomId: state.roomId, audio, lobby, scene }
}