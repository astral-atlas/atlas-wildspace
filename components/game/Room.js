// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type {
  Encounter, EncounterState, Character,

  ExpositionScene
} from "@astral-atlas/wildspace-models";
*/

import { h, useMemo, useRef } from "@lukekaalim/act";
import {
  CompassLayout,
  CompassLayoutMinimap,
  useCompassKeysDirection,
} from "../layout/CompassLayout";
import { Vector2 } from "three";
import { useKeyboardTrack, useKeyboardTrackEmitter } from "../keyboard/track";
import { useElementKeyboard } from "../keyboard";
import { EncounterInitiativeTracker } from "../entry";
import { SceneRenderer } from "../../docs/src/scenes/exposition";
import { AssetLibrary } from "../asset";

/*::
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { GameID } from "@astral-atlas/wildspace-models";
import type { GameData } from "./data";
*/

const style = {
  width: '100%',
  height: '100%',
}

const RoomScreen = ({ children }) => {
  return h('div', { style }, children);
}

const scene = {
  type: 'location',
  name: 'Yolo',
  location: { background: { type: 'color', color: 'green' }, content: 'Hi!' },
}

const RoomSceneScreen = ({ client, }) => {
  
  return h(RoomScreen, {}, h(SceneRenderer, { scene }))
}
const RoomAssetLibraryScreen = ({ client, data, gameId }) => {
  return h(RoomScreen, {}, h(AssetLibrary, { client, data, gameId }))
}

/*::
export type RoomProps = {
  data: GameData,
  client: WildspaceClient,
  gameId: GameID,
};
*/

export const Room/*: Component<RoomProps>*/ = ({ client, data, gameId }) => {

  const screens = [
    //{ content: h(RoomSceneScreen, { scenes }), icon: null, position: new Vector2(0, 0) },
    { content: h(RoomAssetLibraryScreen, { client, data, gameId }), icon: null, position: new Vector2(0, 0) }
  ];

  const ref = useRef();
  const track = useKeyboardTrack(useElementKeyboard(ref))
  const emitter = useKeyboardTrackEmitter(track);

  const [direction, setDirection] = useCompassKeysDirection(emitter, screens)

  return [
    h('div', { ref, style: { width: '100%', height: '100%' } }, [
      h(CompassLayout, { screens, direction }),
    ])
  ]
};
