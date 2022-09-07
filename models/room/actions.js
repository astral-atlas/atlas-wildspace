// @flow strict

/*::
import type { AudioPlaylistID } from "../audio";
import type { GameConnectionID } from "../game/connection";
import type { Scene, SceneContent } from "../game/scene";
import type { JSONSerializedNode } from "../prose";
import type { UserID } from "@astral-atlas/sesame-models";

export type RoomStateActionMetadata = {|
  time: number,
  id: string,
|};

export type RoomStateAction = {|
  ...(
    | {| type: 'change-scene-content', content: SceneContent |}
    | {| type: 'load-scene', scene: Scene |}
    // Message actions
    | {| type: 'send-message', user: UserID, message: JSONSerializedNode |}
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