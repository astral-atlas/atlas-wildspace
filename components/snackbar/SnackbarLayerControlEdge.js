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
    ...state.miniTheater.layers
      .filter((layer) => {
        if (state.isGM)
          return true;
        switch (layer.permissions.type) {
          case 'gm-in-game':
            return false;
          case 'players-in-game':
            return true;
          case 'allowlist':
            return false;
        }
      })
      .map(layer => ({
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
  const onLayerChange = (selectedLayer, properties) => {
    const remoteAction = {
      type: 'set-layers',
      layers: state.miniTheater.layers.map(layer => {
        return layer.id === selectedLayer.id ? { ...layer, ...properties } : layer;
      })
    }
    controller.act({ type: 'remote-action', remoteAction })
  }
  const onLayerPermissionTypeChange = (selectedLayer, type) => {
    switch (type) {
      case 'allowlist':
        return onLayerChange(selectedLayer, { permissions: { type: 'allowlist', userIds: [] }});
      case 'gm-in-game':
      default:
        return onLayerChange(selectedLayer, { permissions: { type: 'gm-in-game' }});
      case 'players-in-game':
        return onLayerChange(selectedLayer, { permissions: { type: 'players-in-game' }});
    }
  }
  const onDeleteLayerClick = (selectedLayer) => () => {
    const remoteAction = {
      type: 'set-layers',
      layers: state.miniTheater.layers.filter(layer => layer.id !== selectedLayer.id)
    }
    controller.act({ type: 'remote-action', remoteAction })
  }
  return [
    h(EditorForm, {}, [
      h(SelectEditor, { values, selected: state.layer || '', onSelectedChange: onSelectedLayerChange }),
      h(EditorHorizontalSection, {}, [
        h(EditorButton, {
          disabled: !state.isGM,
          label: 'Add Layer',
          onButtonClick: onAddLayerClick
        }),
        !!selectedLayer && h(EditorButton, {
          disabled: !state.isGM,
          label: 'Delete Selected Layer',
          onButtonClick: onDeleteLayerClick(selectedLayer)
        }),
      ]),
      !!selectedLayer && [
        h(EditorTextInput, {
          label: 'Layer Name',
          text: selectedLayer.name,
          onTextChange: onLayerNameChange(selectedLayer)
        }),
        h(EditorHorizontalSection, {}, [
          h(EditorCheckboxInput, {
            disabled: !state.isGM,
            label: 'Visible',
            checked: selectedLayer.visible,
            onCheckedChange: onVisibleChange(selectedLayer)
          }),
          h(SelectEditor, {
            disabled: !state.isGM,
            label: 'Permissions',
            values: [{ value: 'gm-in-game' }, { value: 'players-in-game'}, { value: 'allowlist' }],
            selected: selectedLayer.permissions.type,
            onSelectedChange: type => onLayerPermissionTypeChange(selectedLayer, type)
          })
        ]),
        h(EditorLayerIncludesInput, {
          state,
          includes: selectedLayer.includes,
          onIncludesChange: onIncludesChange(selectedLayer)
        })
      ],
    ])
  ];
}

const EditorLayerIncludesInput = ({ includes, onIncludesChange, state }) => {
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
  const onIncludesRemove = (index) => () => {
    onIncludesChange(includes.filter((inc, i) => i !== index))
  }
  return [
    h(EditorButton, {
      label: "Add new Includes",
      onButtonClick: onClickAddIncludes,
      disabled: !state.isGM,
    }),
    h('ol', { style: { listStyle: 'none', padding: 0, margin: 0 }}, [
      includes.map((includes, index) => {
        return h('li', {}, [
          h(EditorHorizontalSection, {}, [
            h(SelectEditor, {
              disabled: !state.isGM,
              values: includesValues,
              selected: includes.type,
              onSelectedChange: onIncludesTypeChange(index)
            }),
            h(EditorButton, {
              disabled: !state.isGM,
              label: 'Delete',
              onButtonClick: onIncludesRemove(index)
            })
          ])
        ])
      })
    ])
  ]
}