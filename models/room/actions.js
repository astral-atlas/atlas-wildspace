// @flow strict
import { c, castObject } from "@lukekaalim/cast";
import { castScene, castSceneContent } from "../game/scene.js";

/*::
import type { Cast } from "@lukekaalim/cast";
import type { UserID } from "@astral-atlas/sesame-models";

import type { AudioPlaylistID } from "../audio";
import type { GameConnectionID } from "../game/connection";
import type { Scene, SceneContent } from "../game/scene";
import type { ProseMirrorJSONNode } from "prosemirror-model";

export type RoomStateActionMetadata = {|
  time: number,
  id: string,
|};

export type RoomStateAction = {|
  ...(
    | {| type: 'change-scene-content', content: SceneContent |}
    | {| type: 'load-scene', scene: Scene |}
    // Message actions
    | {| type: 'send-message', user: UserID, message: ProseMirrorJSONNode |}
    // Audio actions
    | {| type: 'change-playlist', playlist: AudioPlaylistID |}
    | {| type: 'ajust-volume', volume: number |}
    | {| type: 'pause-audio' |}
    | {| type: 'stop-audio' |}
    | {| type: 'resume-audio' |}
  ),
  ...RoomStateActionMetadata
|}
*/
export const castRoomStateActionMetadata/*: Cast<RoomStateActionMetadata>*/ = c.obj({
  time: c.num,
  id: c.str,
})

const actionContentCasts = {
  'change-scene-content': c.obj({ type: c.lit('change-scene-content'), content: castSceneContent }),
  'load-scene':           c.obj({ type: c.lit('load-scene'),  scene: castScene }),
}

const castActionContent = (value) => {
  const type = c.str(value.type);
  const cast = actionContentCasts[type];
  if (!cast)
    throw new Error();
  return cast(value);
}

export const castRoomStateAction/*: Cast<RoomStateAction>*/ = value => {
  const meta = castRoomStateActionMetadata(value);
  const obj = castObject(value);
  const content = castActionContent(obj);
  return {
    ...meta,
    ...content,
  }
}