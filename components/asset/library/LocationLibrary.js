// @flow strict
import { h, useState } from "@lukekaalim/act"
import colorString from 'color-string'

import { AssetLibraryWindow } from "./window";
import {
  EditorButton,
  EditorForm,
  EditorFormSubmit,
  EditorHorizontalSection,
  EditorTextAreaInput,
  EditorTextInput,
  FilesEditor,
} from "../../editor/form";
import { AssetGrid, AssetGridItem } from "../grid";
import { useSelection } from "../../editor/selection";
import { useAsync } from "../../utils/async";

/*::
import type { GameID, ExpositionScene } from "@astral-atlas/wildspace-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { Component } from "@lukekaalim/act";

import type { LocalAsset } from "../../audio/track";
import type { AssetDownloadURLMap } from "../map";
import type { GameData } from "../../game/data";

export type LocationLibraryProps = {
  gameId: GameID,
  data: GameData,
  client: WildspaceClient,
  assets: AssetDownloadURLMap,
};
*/

export const LocationLibrary/*: Component<LocationLibraryProps>*/ = ({ gameId, client, data }) => {
  const [selection, select] = useSelection()

  const onNewLocationSubmit = async () => {
    await client.game.location.create(gameId);
  }

  const editor = [
    h(LocationEditor, { gameId, data, client, selection })
  ];
  const content = [
    h(EditorForm, { onEditorSubmit: onNewLocationSubmit }, [
      h(EditorFormSubmit, { label: 'Create new Location' })
    ]),
    h('hr'),
    h(LocationGrid, { locations: data.locations, select, selection, client })
  ];

  return h(AssetLibraryWindow, { editor, content })
};

const LocationEditor = ({ gameId, data, client, selection }) => {
  const editingLocation = data.locations.find(l => l.id === selection[0]);

  if (!editingLocation)
    return 'Select Something';

  const onEditLocation = async (updatedLocation) => {
    await client.game.location.update(gameId, updatedLocation)
  };
  const onDeleteLocation = async (locationId) => {
    await client.game.location.destroy(gameId, locationId)
  }

  return [
    h(EditorForm, {}, [
      h(EditorButton, { label: 'Delete', onButtonClick: () => onDeleteLocation(editingLocation.id) }),
      h(EditorTextInput, { label: 'id', disabled: true, text: editingLocation.id }),
      h(EditorTextInput, { label: 'title', text: editingLocation.title,
        onTextChange: title => onEditLocation({ ...editingLocation, title }) }),
      h(EditorTextAreaInput, { label: 'description', text: editingLocation.description.plaintext,
        onTextChange: plaintext => onEditLocation({ ...editingLocation, description: { type: 'plaintext', plaintext } }) }),
      h(LocationBackgroundEditor, { editingLocation,
        onBackgroundChange: background => onEditLocation({ ...editingLocation, background }), client }),
    ]),
  ]
}

const LocationBackgroundEditor = ({ editingLocation: { background }, onBackgroundChange, client }) => {

  const onTypeChange = (e) => {
    switch (e.target.value) {
      case 'color':
        return onBackgroundChange({ type: 'color', color: 'white' })
      case 'image':
        return onBackgroundChange({ type: 'image', imageAssetId: null })
      default:
    }
  };
  const onColorChange = (e) => {
    onBackgroundChange({ type: 'color', color: e.target.value })
  }
  const onImageFileChange = async (files) => {
    const file = files[0];
    if (!file) {
      onBackgroundChange({ type: 'image', imageAssetId: null })
    }
    const { description } = await client.asset.create(file.name, file.type, new Uint8Array(await file.arrayBuffer()))
    onBackgroundChange({ type: 'image', imageAssetId: description.id })
  }

  return [
    h('select', { onChange: onTypeChange }, [
      h('option', { selected: background.type === 'color', value: 'color' }, 'Color'),
      h('option', { selected: background.type === 'image', value: 'image' }, 'Image'),
    ]),
    background.type === 'color' &&
      h('input', {
        type: 'color',
        onChange: onColorChange,
        value: colorString.to.hex(colorString.get.rgb(background.color))
      }),
    background.type === 'image' && [
      h(FilesEditor, { label: 'image file', onFilesChange: onImageFileChange, accept: 'image/*' }),
      h(EditorTextInput, { disabled: true, label: 'imageAssetId', text: background.imageAssetId || 'null' })
    ]
  ]
}

const LocationGrid = ({ locations, select, selection, client }) => {
  const [assetMap] = useAsync(async () => new Map(await Promise.all(locations
    .map(l => l.background)
    .map(b => b.type === 'image' ? b : null)
    .filter(Boolean)
    .map(b => b.imageAssetId ? b.imageAssetId : null)
    .filter(Boolean)
    .map(async i => [i, await client.asset.peek(i)]))
  ), [locations])

  console.log(assetMap);

  return h(AssetGrid, {}, locations.map(location =>
    h(AssetGridItem, {
      id: location.id,
      select,
      background: [
        location.background.type === 'color' && h('div', { style: { backgroundColor: location.background.color } }),
        location.background.type === 'image' && !!assetMap && h('img', { src: assetMap.get(location.background.imageAssetId)?.downloadURL }),
      ],
      selected: !!selection.find(id => id === location.id)
    },
      location.title)))
}