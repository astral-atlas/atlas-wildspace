// @flow strict


/*::
import type { Component } from '@lukekaalim/act';
import type {
  Game, Character,
  Scene, SceneID,
  Exposition,
  MiniTheater,
  Location,
} from '@astral-atlas/wildspace-models';
import type { UserID } from "@astral-atlas/sesame-models";

import type { AssetDownloadURLMap } from "../../asset/map";
import type { WildspaceClient } from '@astral-atlas/wildspace-client2';
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

/*::
export type SceneAisleProps = {
  game: Game,
  userId: UserID,
  
  scenes: $ReadOnlyArray<Scene>,
  expositions: $ReadOnlyArray<Exposition>,
  miniTheaters: $ReadOnlyArray<MiniTheater>,
  locations: $ReadOnlyArray<Location>,

  assets: AssetDownloadURLMap,

  client: WildspaceClient
}
*/

export const SceneAisle/*: Component<SceneAisleProps>*/ = ({
  game,
  userId,

  scenes,
  expositions,
  miniTheaters,
  locations,

  assets,
  client,
}) => {
  const selection = useLibrarySelection();

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

  return [
    h(LibraryAisle, {
      floor: h(LibraryFloor, {}, [
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
      ]),
      desk: [
        !!selectedScene && h(EditorForm, {}, [
          h(EditorTextInput, { label: 'Title', text: selectedScene.title, onTextInput: debounce(title => onUpdateScene(selectedScene, { title })) }),
          h(EditorButton, { label: 'Delete Scene', onButtonClick: () => onDeleteScene(selectedScene) }),
          h(SceneSubjectEditor, { locations, selectedScene, miniTheaters, expositions, onUpdateScene })
        ])
      ]
    }),
  ];
};

const SceneSubjectEditor = ({ selectedScene, miniTheaters, expositions, onUpdateScene }) => {
  const [expositionId, setExpositionId] = useState()
  const [miniTheaterId, setMiniTheaterId] = useState()
  const { content } = selectedScene;

  return [
    h(SelectEditor, {
      values: [...expositions.map(e => ({ value: e.id, title: e.name })), { value: '', title: 'None' }],
      selected: content.type === 'exposition' && content.expositionId || '',
      onSelectedChange: selected => {
        if (!selected)
          return;
        onUpdateScene(selectedScene, { content: { type: 'exposition', expositionId: selected }})
      }
    }),
    h(SelectEditor, {
      values: [...miniTheaters.map(m => ({ value: m.id, title: m.name })), { value: '', title: 'None' }],
      selected: content.type === 'mini-theater' && content.miniTheaterId || '',
      onSelectedChange: selected => {
        if (!selected)
          return;
        onUpdateScene(selectedScene, { content: { type: 'mini-theater', miniTheaterId: selected }})
      }
    }),
  ]
}