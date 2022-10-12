// @flow strict


/*::
import type { Component } from '@lukekaalim/act';
import type {
  Game, Character,
  Scene, SceneID,
  Exposition,
  MiniTheater,
  Location,
  LibraryData,
} from '@astral-atlas/wildspace-models';
import type { UserID } from "@astral-atlas/sesame-models";

import type { AssetDownloadURLMap } from "../../asset/map";
import type { WildspaceClient, UpdatesConnection } from '@astral-atlas/wildspace-client2';
*/

import { h, useState } from "@lukekaalim/act"
import { useLibrarySelection } from "../librarySelection";
import { LibraryAisle } from "../LibraryAisle";
import { LibraryShelf } from "../LibraryShelf";
import { EditorForm, EditorButton, EditorTextInput } from "../../editor";
import { PopupOverlay } from "../../layout";
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { CharacterSheet } from "../../paper/CharacterSheet";
import debounce from "lodash.debounce";
import { SelectEditor } from "../../editor/form";
import { LibraryDesk } from "../LibraryDesk";
import { useAisleFocus } from "../useAisleFocus";
import { SceneContentEditor } from "../../scene/SceneContentEditor";

/*::
export type SceneAisleProps = {
  game: Game,
  userId: UserID,
  
  data: LibraryData,

  assets: AssetDownloadURLMap,

  client: WildspaceClient,
  connection: UpdatesConnection,
}
*/

export const SceneAisle/*: Component<SceneAisleProps>*/ = ({
  game,
  userId,

  data,

  assets,
  client,
  connection,
}) => {
  const selection = useLibrarySelection();
  const { focus, toggleFocus } = useAisleFocus();
  const { scenes } = data;

  const selectedScene = scenes.find(c => selection.selected.has(c.id));

  const [stagingTitle, setStagingTitle] = useState('')

  const onCreateNewScene = async () => {
    await client.game.scene.create(game.id, { title: stagingTitle });
  }
  const onUpdateScene = async (scene, sceneProps) => {
    await client.game.scene.update(game.id, scene.id, { ...scene, ...sceneProps });
  }
  const onDeleteScene = async (scene) => {
    await client.game.scene.destroy(game.id, scene.id);
  }

  const floor = h(LibraryFloor, {}, [
    h(LibraryFloorHeader, { title: 'Scenes', }, [
      h(EditorForm, {}, [
        h(EditorButton, { label: 'Create new Scene', onButtonClick: () => onCreateNewScene() }),
        h(EditorTextInput, { label: 'Title', text: stagingTitle, onTextInput: setStagingTitle }),
      ]),
    ]),
    h(LibraryShelf, { title: 'Scenes', selection, books: scenes.map(s => ({
      title: s.title,
      id: s.id,
    })) }),
  ]);
  const desk = h(LibraryDesk, {}, [
    !!selectedScene && h(EditorForm, {}, [
      h(EditorTextInput, { label: 'Title', text: selectedScene.title, onTextChange: title => onUpdateScene(selectedScene, { title }) }),
      h(EditorButton, { label: 'Delete Scene', onButtonClick: () => onDeleteScene(selectedScene) }),
      h(EditorButton, { label: 'Edit Content', onButtonClick: toggleFocus })
    ])
  ])

  const workstation = [
    !!selectedScene && h(SceneContentEditor, {
      content: selectedScene.content,
      library: data,
      assets,
      client,
      connection,
      onContentUpdate: content => onUpdateScene(selectedScene, { content }),
    })
  ];

  return [
    h(LibraryAisle, { floor, desk, workstation, focus }),
  ];
};
