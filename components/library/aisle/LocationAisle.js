// @flow strict


/*::
import type { Component } from '@lukekaalim/act';
import type {
  Game, Character,
  Scene, SceneID,
  Location,
  MiniTheater,
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
import {
  EditorTextAreaInput,
  FilesButtonEditor,
  SelectEditor,
} from "../../editor/form";

/*::
export type LocationAisleProps = {
  game: Game,
  userId: UserID,
  
  locations: $ReadOnlyArray<Location>,

  assets: AssetDownloadURLMap,

  client: WildspaceClient
}
*/

export const LocationAisle/*: Component<LocationAisleProps>*/ = ({
  game,
  userId,

  locations,

  assets,
  client,
}) => {
  const selection = useLibrarySelection();

  const selectedLocation = locations.find(c => selection.selected.has(c.id));

  const [stagingTitle, setStagingTitle] = useState('')

  const onCreateNewLocation = async () => {
    await client.game.location.create(game.id);
  }
  const onUpdateLocation = async (location, locationProps) => {
    await client.game.location.update(game.id, { ...location, ...locationProps });
  }
  const onDeleteLocation = async (location) => {
    await client.game.location.destroy(game.id, location.id);
  }
  const onUploadBackgroundImage = async (location, [backgroundImage]) => {
    const asset = await client.asset.create(
      `Location "{${location.title}" Background`,
      backgroundImage.type,
      new Uint8Array(await backgroundImage.arrayBuffer())
    )
    await client.game.location.update(game.id, { ...location, background: { type: 'image', imageAssetId: asset.description.id } })
  }

  return [
    h(LibraryAisle, {
      floor: h(LibraryFloor, {}, [
        h(LibraryFloorHeader, { title: 'Locations', }, [
          h(EditorForm, {}, [
            h(EditorButton, { label: 'Create new Location', onButtonClick: () => onCreateNewLocation() }),
          ]),
        ]),
        h(LibraryShelf, { title: 'All Locations', selection, books: locations.map(e => ({
          title: e.title,
          id: e.id,
          coverURL: e.background.type === 'image' && e.background.imageAssetId && assets.get(e.background.imageAssetId)?.downloadURL || null
        })) }),
      ]),
      desk: [
        !!selectedLocation && h(EditorForm, {}, [
          h(EditorTextInput, {
            label: 'Title', text: selectedLocation.title,
            onTextInput: debounce(title => onUpdateLocation(selectedLocation, { title }), 1000)
          }),
          h(EditorTextAreaInput, {
            label: 'Description', text: selectedLocation.description.plaintext,
            onTextInput: debounce(plaintext => onUpdateLocation(selectedLocation, { description: { type: 'plaintext', plaintext } }), 1000)
          }),
          h(FilesButtonEditor, { label: 'Background Image', onFilesChange: files => onUploadBackgroundImage(selectedLocation, files) }),
          selectedLocation.background.type === 'image' && !!selectedLocation.background.imageAssetId &&
            h('img', { src: assets.get(selectedLocation.background.imageAssetId)?.downloadURL }),
          h(EditorButton, { label: 'Delete Location', onButtonClick: () => onDeleteLocation(selectedLocation) }),
        ])
      ]
    }),
  ];
};

const SceneSubjectEditor = ({ selectedScene, miniTheaters, Locations, onUpdateScene }) => {
  const [LocationId, setLocationId] = useState()
  const [miniTheaterId, setMiniTheaterId] = useState()
  const { content } = selectedScene;

  return [
    h(SelectEditor, {
      values: [...Locations.map(e => ({ value: e.id, title: e.name })), { value: '', title: 'None' }],
      selected: content.type === 'Location' && content.LocationId || '',
      onSelectedChange: selected => {
        if (!selected)
          return;
        onUpdateScene(selectedScene, { content: { type: 'Location', LocationId: selected }})
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