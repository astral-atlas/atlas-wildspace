// @flow strict

import { c } from "@lukekaalim/cast";
import { v4 as uuid } from 'uuid';
import { castRoomAudioState, reduceRoomAudioState } from "./audio.js";
import { castRoomSceneState } from "./scene.js";
import { castRoomId } from "./room.js";
import { reduceSceneState } from "./scene.js";

/*::
import type { Cast } from "@lukekaalim/cast";

import type { EncounterState } from "../encounter";
import type { GameUpdate } from "../game";
import type { RoomAudioState } from "./audio";
import type { RoomSceneState } from "./scene";
import type { RoomID } from "./room";
import type { MiniTheaterID } from "../game/miniTheater";
import type { AudioPlaylistID } from "../audio";
import type { ExpositionSubject } from "../game/exposition";
import type { RoomStateAction } from "./actions";
*/

/*::
export type RoomState = {|
  version: string,
  roomId: RoomID,

  audio: RoomAudioState,
  scene: RoomSceneState,
|};
*/

export const castRoomState/*: Cast<RoomState>*/ = c.obj({
  roomId: castRoomId,
  audio: castRoomAudioState,
  scene: castRoomSceneState,

  version: c.str,
})

export const reduceRoomState = (state/*: RoomState*/, action/*: RoomStateAction*/)/*: RoomState*/ => ({
  roomId: state.roomId,
  version: state.version,

  audio: reduceRoomAudioState(state.audio, action),
  scene: reduceSceneState(state.scene, action),
})

export const updateRoomVersion = (state/*: RoomState*/)/*: RoomState*/ => {
  return {
    ...state,
    version: uuid(),
  }
}