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
export type ExpositionAisleProps = {
  game: Game,
  userId: UserID,
  
  expositions: $ReadOnlyArray<Exposition>,
  locations: $ReadOnlyArray<Location>,

  assets: AssetDownloadURLMap,

  client: WildspaceClient
}
*/

export const ExpositionAisle/*: Component<ExpositionAisleProps>*/ = ({
  game,
  userId,

  expositions,
  locations,

  assets,
  client,
}) => {
  const selection = useLibrarySelection();

  const selectedExposition = expositions.find(c => selection.selected.has(c.id));

  const [stagingName, setStagingName] = useState('')

  const onCreateNewExposition = async () => {
    await client.game.exposition.create(game.id, { name: stagingName });
  }
  const onUpdateExposition = async (exposition, expositionProps) => {
    await client.game.exposition.update(game.id, exposition.id, { ...exposition, ...expositionProps });
  }
  const onDeleteExposition = async (exposition) => {
    await client.game.exposition.destroy(game.id, exposition.id);
  }

  return [
    h(LibraryAisle, {
      floor: h(LibraryFloor, {}, [
        h(LibraryFloorHeader, { title: 'Expositions', }, [
          h(EditorForm, {}, [
            h(EditorButton, { label: 'Create new Scene', onButtonClick: () => onCreateNewExposition() }),
            h(EditorTextInput, { label: 'Title', text: stagingName, onTextInput: setStagingName }),
          ]),
        ]),
        h(LibraryShelf, { title: 'All Expositions', selection, books: expositions.map(e => ({
          title: e.name,
          id: e.id,
        })) }),
      ]),
      desk: [
        !!selectedExposition && h(EditorForm, {}, [
          h(EditorTextInput, { label: 'Name', text: selectedExposition.name, onTextInput: debounce(name => onUpdateExposition(selectedExposition, { name }), 1000) }),
          h(EditorButton, { label: 'Delete Scene', onButtonClick: () => onDeleteExposition(selectedExposition) }),
          h(ExpositionSubjectEditor, { selectedExposition, locations, onUpdateExposition })
        ])
      ]
    }),
  ];
};

const ExpositionSubjectEditor = ({ selectedExposition, locations, onUpdateExposition }) => {
  const { subject } = selectedExposition;

  return [
    h(EditorButton, { label: 'Clear Subject', onButtonClick: () => onUpdateExposition(selectedExposition, { subject: { type: 'none' } }) }),
    h(SelectEditor, {
      values: [...locations.map(e => ({ value: e.id, title: e.title })), { value: '', title: 'None' }],
      selected: subject.type === 'location' && subject.locationId || '',
      onSelectedChange: locationId => {
        if (!locationId)
          return;
        onUpdateExposition(selectedExposition, { subject: { type: 'location', locationId }})
      }
    }),
  ]
}