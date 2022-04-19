// @flow strict

import { h, useState } from "@lukekaalim/act"
import { TracksLibrary } from "./audioTrack.js"
import { SceneLibrary } from "./scene";

import styles from './AssetLibrary.module.css';
import { LocationLibrary } from "./LocationLibrary.js";

/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { GameID } from "@astral-atlas/wildspace-models";
import type { GameData } from "../../game/data";

export type AssetLibraryProps = {
  gameId: GameID,
  data: GameData,
  client: WildspaceClient
};

export type AssetLibraryMode =
  | 'playlist'
  | 'track'
  | 'scene'
  | 'location'
  | 'none'
*/

export const AssetLibrary/*: Component<AssetLibraryProps>*/ = ({ client, data, gameId }) => {
  const [mode, setMode] = useState('none');

  const onModeSet = (nextMode) => {
    setMode(nextMode)
  }

  return h('div', { class: styles.assetLibrary }, [
    h(AssetLibraryModeInput, { mode, onModeSet }),
    h('div', { class: styles.subLibraryContainer }, h(AssetLibrarySubLibrary, { mode, data, client, gameId }))
  ]);
}

/*::
export type AssetLibraryModeInputButtonProps = {
  currentMode:  AssetLibraryMode,
  mode: AssetLibraryMode,
  onModeSet: AssetLibraryMode => mixed,
  classList?: string[]
}
*/

const AssetLibraryModeInputButton/*: Component<AssetLibraryModeInputButtonProps>*/ = ({
  currentMode, mode, onModeSet, classList = []
}) => {
  return h('button', {
    classList: [styles.modeInputButton, ...classList],
    disabled: currentMode === mode,
    onClick: () => onModeSet(mode)
  }, mode)
}

const AssetLibraryModeInput = ({ mode, onModeSet }) => {
  return h('div', { class: styles.modeInput }, [
    h(AssetLibraryModeInputButton, { currentMode: mode, mode: 'scene', onModeSet }),
    h(AssetLibraryModeInputButton, { currentMode: mode, mode: 'track', onModeSet }),
    h(AssetLibraryModeInputButton, { currentMode: mode, mode: 'location', onModeSet }),
    h(AssetLibraryModeInputButton, { currentMode: mode, mode: 'playlist', onModeSet }),
    h(AssetLibraryModeInputButton, { currentMode: mode, mode: 'none', onModeSet, classList: [styles.none] }),
  ])
}
const AssetLibrarySubLibrary = ({ mode, data, client, gameId }) => {
  switch (mode) {
    case 'location':
      return h(LocationLibrary, { assets: new Map(), data, client, gameId })
    case 'scene':
      return h(SceneLibrary, { assets: new Map(), data, client, gameId });
    case 'track':
      //return h(TracksLibrary, { })
    default:
      return 'Pick a mode';
  }
}