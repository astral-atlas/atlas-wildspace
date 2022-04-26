// @flow strict

import { h, useState } from "@lukekaalim/act"

import { AssetLibraryWindow } from "./window";
import {
  EditorButton,
  EditorForm,
  EditorFormSubmit,
  EditorHorizontalSection,
  EditorTextAreaInput,
  EditorTextInput,
  SelectEditor,
} from "../../editor/form";
import { AssetGrid, AssetGridItem } from "../grid";
import { useAsync } from "../../utils/async";

/*::
import type { GameID, ExpositionScene } from "@astral-atlas/wildspace-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { Component } from "@lukekaalim/act";

import type { LocalAsset } from "../../audio/track";
import type { GameData } from "../../game/data";

export type SceneLibraryProps = {
  gameId: GameID,
  data: GameData,
  client: WildspaceClient,
};
*/

export const SceneLibrary/*: Component<SceneLibraryProps>*/ = ({ gameId, client, data }) => {
  const [selected, setSelected] = useState({ exposition: [] })
  const onSelectionChange = (newSelection) => {
    setSelected(newSelection)
  }
  const onExpositionSceneChange = async (exposition) => {
    await client.game.scene.update(gameId, exposition);
  }
  const onExpositionSceneDelete = async (exposition) => {
    await client.game.scene.destroy(gameId, exposition.id);
  }

  const editor = [
    h(SceneEditor, { client, selected, data, onExpositionSceneChange, onExpositionSceneDelete })
  ];

  const content = [
    h(SceneCreator, { gameId, client }),
    h('hr'),
    h(SceneGrid, { client, scenes: data.scenes, locations: data.locations, assets: data.assets, onSelectionChange, selected })
  ];

  return h(AssetLibraryWindow, { editor, content })
}

const SceneGridBackground = ({ assets, exposition: { subject }, locations }) => {
  switch (subject.type) {
    case 'location':
      const location = locations.find(l => l.id === subject.location)
      if (!location)
        return null;
      const { background } = location;
      switch (background.type) {
        case 'image':
          const asset  = background.imageAssetId && assets.get(background.imageAssetId)
          if (!asset)
            return null;
          return h('img', { src: asset.downloadURL })
      }
    default:
      return null;
  }
}

const SceneGrid = ({ client, scenes, locations, onSelectionChange, selected, assets }) => {
  const onGridItemClick = (exposition) => () => {
    onSelectionChange({ exposition: [exposition.id] })
  };

  return h(AssetGrid, {}, scenes.exposition.map(exposition =>
    h(AssetGridItem, {
      onClick: onGridItemClick(exposition),
      selected: !!selected.exposition.find(id => id === exposition.id),
      background: h(SceneGridBackground, { exposition, locations, assets })
    },
      exposition.title)))
}

const SceneEditor = ({ client, selected, data, onExpositionSceneChange, onExpositionSceneDelete }) => {
  const editingExposition = data.scenes.exposition.find(e => e.id === selected.exposition[0])

  if (!editingExposition)
    return 'Nothing Selected!';

  const { subject } = editingExposition;

  const subjectOptions = [
    { type: 'none' },
    ...data.locations.map(location => ({ type: 'location', location }))
  ]

  const onSubjectChange = (e) => {
    const option = subjectOptions[e.target.value];
    switch (option.type) {
      case 'none':
        return onExpositionSceneChange({ ...editingExposition, subject: { type: 'none' } });
      case 'location':
        return onExpositionSceneChange({ ...editingExposition, subject: { type: 'location', location: option.location.id } });
    }
  }
  const onDescriptionTypeChange = (type) => {
    switch (type) {
      case 'inherit':
        return onExpositionSceneChange({ ...editingExposition, description: { type: 'inherit' } });
      case 'plaintext':
        return onExpositionSceneChange({ ...editingExposition, description: { type: 'plaintext', plaintext: '' } });
    }
  }

  return [
    h(EditorForm, { }, [
      h(EditorButton, { label: 'Delete', onButtonClick: () => onExpositionSceneDelete(editingExposition) }),
      h(EditorTextInput, { label: 'id', text: editingExposition.id, disabled: true }),
      h(EditorTextInput, { label: 'title', text: editingExposition.title, onTextChange: title => onExpositionSceneChange({ ...editingExposition, title }) }),
      h('select', { onChange: onSubjectChange }, [
        subjectOptions.map((option, i) => {
          switch (option.type) {
            case 'location':
              return h('option', {
                value: i,
                selected: subject.type === 'location' && subject.location === option.location.id
              }, `Location: ${option.location.title}`)
            case 'none':
            default:
              return h('option', {
                value: i,
                selected: subject.type === 'none'
              }, 'None')
          }
        }),
      ]),

      h(SelectEditor, {
        label: 'description type',
        values: [{ value: 'inherit' }, { value: 'plaintext' }], 
        selected: editingExposition.description.type,
        onSelectedChange: type => onDescriptionTypeChange(type)
      }),
      editingExposition.description.type === 'plaintext' && [
        h(EditorTextAreaInput, {
          label: 'description',
          text: editingExposition.description.plaintext,
          onTextChange: plaintext => onExpositionSceneChange({ ...editingExposition, description: { type: 'plaintext', plaintext }})
        })
      ]
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