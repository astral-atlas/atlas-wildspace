// @flow strict
/*::
import type {
  TerrainProp, TerrainPropNode
} from "@astral-atlas/wildspace-models";
import type { Component, Ref } from "@lukekaalim/act";

import type { FormSchema } from "../library/LibraryEditorForm";
import type {
  TerrainEditorData,
  TerrainEditorState,
} from "./useTerrainEditorData";
*/

import {
  EditorButton,
  EditorForm,
  EditorHorizontalSection,
  EditorTextInput,
  SelectEditor,
} from "../editor/form";
import { SnackbarControl } from "../snackbar/SnackbarControl";
import { h, useState } from "@lukekaalim/act";
import { renderLibraryEditorForm } from "../library/LibraryEditorForm";
import { v4 } from "uuid";
import { ModelNodeDescription } from "./snackbar/ModelNodeDescription";
import { AddNodeEditor } from "./snackbar/AddNodeEditor";
import { TerrainNodeTree } from "./snackbar/TerrainNodeTree";

/*::
export type TerrainEditorSnackbarProps = {
  cameraButtonRef: Ref<?HTMLElement>,

  editorData: TerrainEditorData,

  onTerrainPropChange?: TerrainProp => mixed,
  onEditorStateChange?: TerrainEditorState => mixed,
};
*/

const NodeList = ({ nodeIds, editorData }) => {
  const nodes = nodeIds
    .map(n => editorData.nodeMap.get(n))
    .filter(Boolean);
  const onClick = (node) => () => {
    editorData.dispatch({ type: 'select', nodeId: node.meta.id, nodePath: node.meta.path });
  };
  return h('ol', {}, nodes.map(n =>
    h('li', {}, [
      h('button', { onClick: onClick(n), disabled: editorData.state.selectedNodeId === n.meta.id }, n.meta.name),
      n.type === 'transform' &&
        h(NodeList, { nodeIds: n.children, editorData })
    ])))
};

const TransformNodeDescription = ({ selectedNode, editorData }) => {
  return [
    h(AddNodeEditor, { editorData, parentNode: selectedNode })
  ]
}

const NodeDescription = ({ editorData }) => {
  const selectedNode = !!editorData.state.selectedNodeId &&
    editorData.nodeMap.get(editorData.state.selectedNodeId);

  const onNodeChange = (nodeProps) => {
    if (!selectedNode)
      return;
    const terrainProp = {
      ...editorData.terrainProp,
      nodes: editorData.terrainProp.nodes.map(n => {
        if (n.meta.id !== selectedNode.meta.id)
          return n;
        switch (selectedNode.type) {
          case 'camera':
            return { ...selectedNode, ...nodeProps };
          case 'floor':
            return { ...selectedNode, ...nodeProps };
          case 'model':
            return { ...selectedNode, ...nodeProps };
          case 'prop':
            return { ...selectedNode, ...nodeProps };
          case 'transform':
            return { ...selectedNode, ...nodeProps };
        }
      })
    }
    editorData.dispatch({ type: 'set-prop', terrainProp })
  }
  const onMetaChange = (metaProps) => {
    if (!selectedNode)
      return;
    onNodeChange({ meta: { ...selectedNode.meta, ...metaProps } });
  }

  return !!selectedNode && h(EditorForm, {}, [
    h(EditorTextInput, { label: 'ID', text: selectedNode.meta.id || '', disabled: true }),
    h(EditorTextInput, { label: 'Path', text: selectedNode.meta.path.join('.') || '', disabled: true }),
    h(EditorTextInput, { label: 'Name', text: selectedNode.meta.name || '', onTextInput: name => onMetaChange({ name }) }),
    selectedNode.type === 'transform' && h(TransformNodeDescription, { editorData, onNodeChange, selectedNode }),
    selectedNode.type === 'model' && h(ModelNodeDescription, { editorData, onNodeChange, selectedNode }),
  ])
};

export const TerrainEditorSnackbar/*: Component<TerrainEditorSnackbarProps>*/ = ({
  editorData,
}) => {
  const selectedNode = !!editorData.state.selectedNodeId &&
    editorData.nodeMap.get(editorData.state.selectedNodeId);

  return h(SnackbarControl, {
    center: !!selectedNode && selectedNode.meta.name || null,
    left: h(NodeDescription, { editorData }),
    right: [
      h(TerrainNodeTree, { terrainEditorData: editorData })
    ]
  });
};