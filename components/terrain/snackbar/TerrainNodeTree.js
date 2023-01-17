// @flow strict
/*::
import type { TerrainEditorData } from "../useTerrainEditorData";
import type { TerrainProp } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
*/

import { EditorForm, EditorTextInput, SelectEditor } from "../../editor/form";
import { h, useState } from "@lukekaalim/act";

import { v4 } from "uuid";

/*::
export type TerrainNodeTreeProps = {
  terrainEditorData: TerrainEditorData,
};
*/

export const TerrainNodeTree/*: Component<TerrainNodeTreeProps>*/ = ({
  terrainEditorData,
}) => {
  return h(TerrainNodeTreeBranchDetails, {
    node: null,
    terrainProp: terrainEditorData.terrainProp,
    terrainEditorData,
    title: terrainEditorData.terrainProp.title,
    nodeIds: terrainEditorData.terrainProp.rootNodes,
  });
};

const NodeThing = ({ node, terrainProp, terrainEditorData }) => {
  switch (node.type) {
    case 'transform':
      return h(TerrainNodeTreeBranchDetails, {
        title: h(TerrainNodeTreeLeafDetails, { node, terrainProp, terrainEditorData }),
        node,
        nodeIds: node.children,
        terrainProp, terrainEditorData
      });
    case 'floor':
    case 'model':
    case 'camera':
    case 'prop':
      return h(TerrainNodeTreeLeafDetails, { node, terrainProp, terrainEditorData });
    default:
      throw new Error();
  }
}

const TerrainNodeTreeBranchDetails = ({
  node = null,
  title,
  nodeIds,
  terrainProp,
  terrainEditorData,
}) => {
  const [nodeType, setNodeType] = useState('transform');
  const [nodeName, setNodeName] = useState('Untitled Node');

  const onNodeAdd = () => {
    terrainEditorData.dispatch({ type: 'add-node', title: nodeName, nodeType, parent: node && node.meta.id })
  }

  return [
    h('details', { open: true }, [
      h('summary', {}, title),
      h('ol', {}, [
        nodeIds
          .map(id => terrainEditorData.nodeMap.get(id))
          .filter(Boolean)
          .map(node => h('li', { key: node.meta.id }, h(NodeThing, { node, terrainProp, terrainEditorData }))),
        h('li', {}, [
          h('details', { }, [
            h('summary', {}, 'Add Nodes'),
            h(EditorForm, {}, [
              h('div', { style: { display: 'flex', flexDirection: 'row', width: '50%' }}, [
                h(SelectEditor, {
                  label: 'Type',
                  values: [
                    { value: 'transform' },
                    { value: 'model' },
                    { value: 'camera' },
                    { value: 'prop' },
                  ],
                  selected: nodeType, onSelectedChange: setNodeType
                }),
                h(EditorTextInput, {
                  label: 'Title',
                  text: nodeName,
                  onTextInput: setNodeName,
                }),
                h('button', {
                  style: { flex: 1, height: '26px', marginTop: '26px' },
                  onClick: onNodeAdd,
                }, `Add`),
              ])
            ])
          ])
        ])
      ])
    ]),
  ];
};

const TerrainNodeTreeLeafDetails = ({
  node,
  terrainEditorData,
  terrainProp
}) => {
  const selected = node.meta.id === terrainEditorData.state.selectedNodeId;

  const onClick = () => {
    terrainEditorData.dispatch({ type: 'select', nodeId: node.meta.id, nodePath: node.meta.path })
  };

  return h('button', {
    disabled: selected,
    onClick,
  }, node.meta.name || node.meta.id);
}