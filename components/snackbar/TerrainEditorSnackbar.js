// @flow strict
/*::
import type { TerrainProp } from "@astral-atlas/wildspace-models";
import type { TerrainEditorState } from "../terrain/TerrainEditor";
import type { Component } from "@lukekaalim/act";
import type { Ref } from "@lukekaalim/act";
*/

import { EditorButton, EditorForm, SelectEditor } from "../editor/form";
import { SnackbarControl } from "./SnackbarControl";
import { h } from "@lukekaalim/act";

/*::
export type TerrainEditorSnackbarProps = {
  cameraButtonRef: Ref<?HTMLElement>,
  terrainProp: TerrainProp,
  onTerrainPropChange?: TerrainProp => mixed,
  editorState: TerrainEditorState,
  onEditorStateChange?: TerrainEditorState => mixed,
};
*/

export const TerrainEditorSnackbar/*: Component<TerrainEditorSnackbarProps>*/ = ({
  cameraButtonRef,
  editorState,
  terrainProp,
  onEditorStateChange,
  onTerrainPropChange,
}) => {
  const selectedShape = terrainProp.floorShapes[editorState.selectedShapeIndex];
  const onToolChange = (nextTool) => {
    switch (nextTool) {
      default:
        case 'none':
        return onEditorStateChange && onEditorStateChange({ ...editorState, tool: 'none' });
      case 'translate':
      case 'rotate':
      case 'scale':
        return onEditorStateChange && onEditorStateChange({ ...editorState, tool: nextTool });
    }
  }
  const onDeleteClick = () => {
    onTerrainPropChange && onTerrainPropChange({
      ...terrainProp,
      floorShapes: terrainProp.floorShapes.filter((f, i) => {
        return i !== editorState.selectedShapeIndex;
      })
    })
  }
  const onAddShape = (shapeToAdd) => () => {
    onTerrainPropChange && onTerrainPropChange({
      ...terrainProp,
      floorShapes: [
        ...terrainProp.floorShapes,
        shapeToAdd,
      ]
    })
  }

  return h(SnackbarControl, {
    left: h(EditorForm, {}, [
      h('button', { ref: cameraButtonRef }, 'Control Camera'),
    ]),
    center: [
      h('button', {
        onClick: onAddShape({
          type: 'box',
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 },
          size: { x: 10, y: 10, z: 10 }
        })
      }, 'Add Box Shape')
    ],
    right: selectedShape && [
      h(EditorForm, {}, [
        h(SelectEditor, {
          values: [{ value: 'none' }, { value: 'translate' }, { value: 'rotate' }, { value: 'scale' }],
          selected: editorState.tool,
          onSelectedChange: onToolChange
        }),
        h(EditorButton, { label: 'Delete Shape', onButtonClick: onDeleteClick })
      ])
    ],
  });
};