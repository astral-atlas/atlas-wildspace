// @flow strict
/*::
import type { TerrainPropNode, TerrainPropTransformNode } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
import type { TerrainEditorData } from "../useTerrainEditorData";
*/

import { h, useState } from "@lukekaalim/act";
import { v4 } from "uuid";
import { EditorHorizontalSection } from "../../editor";
import { EditorButton, SelectEditor } from "../../editor/form";

/*::
export type AddNodeEditorProps = {
  parentNode?: ?TerrainPropTransformNode,
  editorData: TerrainEditorData,
}
*/

export const AddNodeEditor/*: Component<AddNodeEditorProps>*/ = ({
  parentNode,
  editorData
}) => {
  const { terrainProp } = editorData;
  const [stagingNodeType, setStagingNodeType] = useState('transform');

  const createNewNodeFromType = ()/*: TerrainPropNode*/ => {
    const id = v4();
    const meta = {
      id,
      path: parentNode ? [...parentNode.meta.path, id] : [id],
      name: 'Untitled Node'
    }

    switch (stagingNodeType) {
      case 'transform':
        return {
          type: 'transform',
          meta,
          children: [],
          position: { x: 0, y: 0, z: 0 },
          quaternion: { x: 0, y: 0, z: 0, w: 0 }
        };
      case 'model':
        return {
          type: 'model',
          meta,
          modelId: '',
          path: [],
        }
      default:
        throw new Error();
    }
  }

  const onAddClick = () => {
    const nodeToAdd = createNewNodeFromType();

    const nextTerrainProp = {
      ...terrainProp,
      nodes: [
        ...editorData.terrainProp.nodes.map(n => {
          if (!parentNode || n.meta.id !== parentNode.meta.id)
            return n;
          return { ...parentNode, children: [...parentNode.children, nodeToAdd.meta.id ]}
        }),
        nodeToAdd,
      ],
      rootNodes: [
        ...terrainProp.rootNodes,
        ...(parentNode ? [] : [nodeToAdd.meta.id])
      ]
    }
    editorData.dispatch({ type: 'set-prop', terrainProp: nextTerrainProp })
  };

  return [
    h(EditorHorizontalSection, {}, [
      h(SelectEditor, { label: 'Node Type', values: [
        { value: 'transform', title: 'Transform' },
        { value: 'model', title: 'Model' }
      ], selected: stagingNodeType, onSelectedChange: setStagingNodeType }),
      h(EditorButton, {
        label: `Add ${stagingNodeType} Node`,
        text: stagingNodeType,
        onButtonClick: onAddClick
      }),
    ])
  ]
};
