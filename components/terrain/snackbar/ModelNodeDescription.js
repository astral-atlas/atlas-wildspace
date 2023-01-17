// @flow strict

/*::
import type { TerrainEditorData } from "../useTerrainEditorData";
import type { TerrainPropNode, TerrainPropModelNode } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
*/

import { renderLibraryEditorForm } from "../../library/LibraryEditorForm"
import { SelectEditor } from "../../editor/form";
import { h } from "@lukekaalim/act";

/*::
export type ModelNodeDescriptionProps = {
  selectedNode: TerrainPropModelNode,
  editorData: TerrainEditorData,
}
*/

export const ModelNodeDescription/*: Component<ModelNodeDescriptionProps>*/ = ({ editorData, selectedNode }) => {
  const { resources: { objectMap, modelResources }, terrainProp} = editorData;

  const onModelChange = modelId => {
    const nextProp = {
      ...terrainProp,
      nodes: terrainProp.nodes.map(n => {
        if (n.meta.id !== selectedNode.meta.id)
          return n;
        return { ...selectedNode, modelId };
      })
    };
    editorData.dispatch({ type: 'set-prop', terrainProp: nextProp })
  }

  return [
    h(SelectEditor, {
      values: [...modelResources.values()].map(m => ({
        value: m.id,
        title: m.title,
      })),
      selected: selectedNode.modelId,
      onSelectedChange: onModelChange
    })
  ]
}