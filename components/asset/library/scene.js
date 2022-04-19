// @flow strict

import { h, useState } from "@lukekaalim/act"

import { AssetLibraryWindow } from "./window";
import {
  EditorForm,
  EditorFormSubmit,
  EditorHorizontalSection,
  EditorTextInput,
} from "../../editor/form";
import { AssetGrid, AssetGridItem } from "../grid";

/*::
import type { GameID, ExpositionScene } from "@astral-atlas/wildspace-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { Component } from "@lukekaalim/act";

import type { LocalAsset } from "../../audio/track";
import type { AssetDownloadURLMap } from "../map";
import type { GameData } from "../../game/data";

export type SceneLibraryProps = {
  gameId: GameID,
  data: GameData,
  client: WildspaceClient,
  assets: AssetDownloadURLMap,
};
*/

export const SceneLibrary/*: Component<SceneLibraryProps>*/ = ({ gameId, client, data }) => {
  const [selected, setSelected] = useState({ exposition: [] })
  const onSelectionChange = (newSelection) => {
    setSelected(newSelection)
  }

  const editor = [
    h(SceneEditor, { client, selected, data })
  ];

  const content = [
    h(SceneCreator, { gameId, client }),
    h('hr'),
    h(SceneGrid, { scenes: data.scenes, onSelectionChange, selected })
  ];

  return h(AssetLibraryWindow, { editor, content })
}

const SceneGrid = ({ scenes, onSelectionChange, selected }) => {
  const onGridItemClick = (exposition) => () => {
    onSelectionChange({ exposition: [exposition.id] })
  };

  return h(AssetGrid, {}, scenes.exposition.map(exposition =>
    h(AssetGridItem, {
      onClick: onGridItemClick(exposition),
      selected: !!selected.exposition.find(id => id === exposition.id)
    },
      exposition.title)))
}

const SceneEditor = ({ selected, data }) => {
  const editingExposition = data.scenes.exposition.find(e => e.id === selected.exposition[0])

  if (!editingExposition)
    return 'Nothing Selected!';

  return [
    h(EditorForm, { }, [
      h(EditorTextInput, { label: 'id', text: editingExposition.id, disabled: true }),
      h(EditorTextInput, { label: 'title', text: editingExposition.title }),
    ])
  ]
}

const SceneCreator = ({ gameId, client }) => {
  const onEditorSubmit = async () => {
    const scene = await client.game.scene.create(gameId)
  }

  return h(EditorForm, { onEditorSubmit }, [
    h(EditorHorizontalSection, {}, [
      h(EditorFormSubmit, {
        label: 'Add New Exposition Scene'
      })
    ]),
  ])
}