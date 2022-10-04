// @flow strict
/*::
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "../miniTheater/useMiniTheaterController2";
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import {
  EditorButton,
  EditorCheckboxInput,
  EditorForm,
  EditorHorizontalSection,
  EditorTextInput,
  SelectEditor,
} from "../editor/form";
import { v4 } from "uuid";

/*::
export type SnackbarLayerControlEdgeProps = {
  controller: MiniTheaterController2,
  state: MiniTheaterLocalState
};
*/

export const SnackbarLayerControlEdge/*: Component<SnackbarLayerControlEdgeProps>*/ = ({
  controller,
  state,
}) => {
  const values = [
    { value: '', title: '<No Layer>' },
    ...state.miniTheater.layers.map(layer => ({
      value: layer.id,
      title: layer.name,
    }))
  ];
  const selectedLayer = state.miniTheater.layers.find(l => l.id === state.layer);
  const onAddLayerClick = () => {
    const nextLayer = {
      id: v4(),
      name: 'New Layer',
      visible: false,
      permissions: { type: 'gm-in-game' },
      includes: [
        { type: 'any-terrain' },
      ],
      placementRules: []
    }
    const remoteAction = {
      type: 'set-layers',
      layers: [...state.miniTheater.layers, nextLayer]
    }
    controller.act({ type: 'remote-action', remoteAction })
  }
  const onSelectedLayerChange = (layerId) => {
    controller.act({ type: 'set-layer', layerId })
  }
  const onIncludesChange = (selectedLayer) => (includes) => {
    const remoteAction = {
      type: 'set-layers',
      layers: state.miniTheater.layers.map(layer => {
        return layer.id === selectedLayer.id ? { ...layer, includes } : layer;
      })
    }
    controller.act({ type: 'remote-action', remoteAction })
  }
  const onLayerNameChange = (selectedLayer) => (name) => {
    const remoteAction = {
      type: 'set-layers',
      layers: state.miniTheater.layers.map(layer => {
        return layer.id === selectedLayer.id ? { ...layer, name } : layer;
      })
    }
    controller.act({ type: 'remote-action', remoteAction })
  }
  const onVisibleChange = (selectedLayer) => (visible) => {
    const remoteAction = {
      type: 'set-layers',
      layers: state.miniTheater.layers.map(layer => {
        return layer.id === selectedLayer.id ? { ...layer, visible } : layer;
      })
    }
    controller.act({ type: 'remote-action', remoteAction })
  }
  return [
    h(EditorForm, {}, [
      h(SelectEditor, { values, selected: state.layer || '', onSelectedChange: onSelectedLayerChange }),
      h(EditorHorizontalSection, {}, [
        h(EditorButton, { label: 'Add Layer', onButtonClick: onAddLayerClick }),
        !!selectedLayer && h(EditorButton, { label: 'Delete Selected Layer' }),
      ]),
      !!selectedLayer && [
        h(EditorTextInput, {
          label: 'Layer Name',
          text: selectedLayer.name,
          onTextChange: onLayerNameChange(selectedLayer)
        }),
        h(EditorCheckboxInput, { label: 'Visible', checked: selectedLayer.visible, onCheckedChange: onVisibleChange(selectedLayer) }),
        h(EditorLayerIncludesInput, {
          includes: selectedLayer.includes,
          onIncludesChange: onIncludesChange(selectedLayer)
        })
      ],
    ])
  ];
}

const EditorLayerIncludesInput = ({ includes, onIncludesChange }) => {
  const includesValues = [
    { value: 'any' },
    { value: 'any-terrain' },
    { value: 'any-monsters' },
    { value: 'characters' }
  ]
  const onClickAddIncludes = () => {
    onIncludesChange([...includes, { type: 'any' }])
  }
  const onIncludesTypeChange = (index) => (type) => {
    onIncludesChange(includes.map((prevIncludes, i) => {
      if (i !== index)
        return prevIncludes;
      switch (type) {
        default:
        case 'any':
          return { type: 'any' };
        case 'any-terrain':
          return { type: 'any-terrain' };
        case 'any-monsters':
          return { type: 'any-monsters' };
        case 'characters':
          return { type: 'characters', characters: [] };
    }
    }))
  }
  return [
    h(EditorButton, { label: "Add new Includes", onButtonClick: onClickAddIncludes }),
    h('ol', { style: { listStyle: 'none', padding: 0, margin: 0 }}, [
      includes.map((includes, index) => {
        return h('li', {}, [
          h(EditorHorizontalSection, {}, [
            h(SelectEditor, {
              values: includesValues,
              selected: includes.type,
              onSelectedChange: onIncludesTypeChange(index)
            }),
            h(EditorButton, { label: 'Delete' })
          ])
        ])
      })
    ])
  ]
}