// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Scene, RoomPage, GamePage, LibraryData } from "@astral-atlas/wildspace-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
*/
import { h } from "@lukekaalim/act";
import {
  EditorButton,
  EditorForm,
  EditorHorizontalSection,
  EditorVerticalSection,
} from "../editor/form";

/*::
export type RoomStateEditorProps = {
  client: WildspaceClient,
  libraryData: LibraryData,
  roomPage: RoomPage,
  gamePage: GamePage,
}
*/

export const RoomStateEditor/*: Component<RoomStateEditorProps>*/ = ({
  client,
  libraryData,
  gamePage,
  roomPage
}) => {
  const { room, state } = roomPage;
  const { game } = gamePage;
  const { scenes, playlists } = libraryData;

  const onSetSceneActive = async (scene) => {
    await client.room.scene.set(game.id, room.id, { activeScene: scene.id })
  }
  const onSetPlaylistActive = async (playlist) => {
    await client.room.setAudio(game.id, room.id, {
      playback: {
        type: 'playlist',
        playlist: { id: playlist.id, mode: { type: 'playing', startTime: Date.now() }
      }
    }, volume: 1 })
  };

  return h(EditorForm, {}, [
    h('div', { style: { display: 'flex', flexDirection: 'row' }}, [
      h(EditorVerticalSection, {}, scenes.map(scene =>
        h(EditorButton, {
          disabled: state.scene.activeScene === scene.id,
          label: scene.title,
          onButtonClick: () => onSetSceneActive(scene)
        }))),
      h(EditorVerticalSection, {}, playlists.map(playlist =>
        h(EditorButton, {
          disabled: state.audio.playback.type === 'playlist' && state.audio.playback.playlist.id === playlist.id,
          label: playlist.title,
          onButtonClick: () => onSetPlaylistActive(playlist)
        }))),
    ])
  ])
}