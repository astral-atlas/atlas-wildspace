// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { GameID } from "@astral-atlas/wildspace-models";
import type { GameData } from "../../game/data";
*/

import { h, useState } from "@lukekaalim/act"
import { TracksLibrary } from "./audioTrack.js"
import { SceneLibrary } from "./scene";

import styles from './AssetLibrary.module.css';
import { LocationLibrary } from "./LocationLibrary.js";
import { AudioPlaylistLibrary } from "./audioPlaylist.js";
import { RoomLibrary } from "./RoomLibrary.js";
import { MagicItemLibrary } from "./MagicItemLibrary.js";
import { WikiLibrary } from "./WikiLibrary";

/*::
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
  | 'room'
  | 'magicItem'
  | 'wikiDoc'
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
    h(AssetLibraryModeInputButton, { currentMode: mode, mode: 'room', onModeSet }),
    h(AssetLibraryModeInputButton, { currentMode: mode, mode: 'magicItem', onModeSet }),
    h(AssetLibraryModeInputButton, { currentMode: mode, mode: 'wikiDoc', onModeSet }),
    h(AssetLibraryModeInputButton, { currentMode: mode, mode: 'none', onModeSet, classList: [styles.none] }),
  ])
}
const AssetLibrarySubLibrary = ({ mode, data, client, gameId }) => {
  switch (mode) {
    case 'location':
      return h(LocationLibrary, { assets: data.assets, data, client, gameId })
    case 'scene':
      return h(SceneLibrary, { assets: data.assets, data, client, gameId });
    case 'room':
      return h(RoomLibrary, { gameData: data, client });
    case 'wikiDoc':
      return h(WikiLibrary, { gameData: data, client });
    case 'magicItem':
      return h(MagicItemLibrary, { assets: data.assets, data, client, gameId });
    case 'track':
      return h(TracksLibrary, { gameData: data, gameId, playlistClient: client.audio.playlist, trackClient: client.audio.tracks })
    case 'playlist':
      return h(AudioPlaylistLibrary, { gameId, playlist: client.audio.playlist, gameData: data })
    default:
      return 'Pick a mode';
  }
}