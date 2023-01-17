// @flow strict

import { h, useState } from "@lukekaalim/act";
import {
  EditorNumberInput,
  EditorTextInput,
  SelectEditor,
} from "../../editor/form";
import { createTerrainPropGroup } from "../createTerrainPropGroup";
import styles from './NodeDetails.module.css';
import { useEffect } from "@lukekaalim/act/hooks";
import { Camera, PerspectiveCamera, Scene, Vector3 } from "three";

/*::
import type { Component } from "@lukekaalim/act";
import type { TerrainPropNode } from "@astral-atlas/wildspace-models";
import type { TerrainEditorData } from "../useTerrainEditorData";
*/

/*::
export type NodeDetailsProps = {
  node: TerrainPropNode,
  editor: TerrainEditorData,
}
*/

export const NodeDetails/*: Component<NodeDetailsProps>*/ = ({ editor, node }) => {
  const { onMetaChange } = useNodeMetaChange(editor, node);
  switch (node.type) {
    case 'transform':
      return h(TransformNodeDetails, { editor, node })
    case 'model':
      return h(ModelNodeDetails, { editor, node })
    case 'floor':
      return h(FloorNodeDetails, { editor, node })
    case 'camera':
      return h(CameraNodeDetails, { editor, node })
    default:
      return h(NodeMetaDetails, { editor, meta: node.meta, onMetaChange });
  }
};

const NodeMetaDetails = ({ editor, meta, onMetaChange }) => {
  const onClickDelete = () => {
    editor.dispatch({ type: 'remove-node', nodeId: meta.id })
  }

  return [
    h('div', { class: styles.metaDetails }, [
      h('button', { onClick: onClickDelete }, 'Delete'),
      h(EditorTextInput, { label: 'ID', disabled: true, text: meta.id }),
      h(EditorTextInput, { label: 'Path', disabled: true, text: meta.path.join('.') }),
      h(EditorTextInput, { label: 'Name', text: meta.name || '', onTextInput: name => onMetaChange({ ...meta, name }) })
    ])
  ]
};

const useNodeMetaChange = (editor, node) => {
  const onNodeChange = (node) => {
    editor.dispatch({
      type: 'set-prop',
      terrainProp: {
        ...editor.terrainProp,
        nodes: editor.terrainProp.nodes.map(n => n.meta.id === node.meta.id
          ? node
          : n)
      },
    });
  }
  const onMetaChange = (meta) => {
    onNodeChange({ ...node, meta });
  };
  return { onMetaChange, onNodeChange };
}

const VectorInput = ({ vector, onVectorChange }) => {
  return h('div', { style: { display: 'flex', flexDirection: 'row' }}, [
    h(EditorNumberInput, { label: 'x', number: vector.x, onNumberInput: x => onVectorChange({ ...vector, x }) }),
    h(EditorNumberInput, { label: 'y', number: vector.y, onNumberInput: y => onVectorChange({ ...vector, y }) }),
    h(EditorNumberInput, { label: 'z', number: vector.z, onNumberInput: z => onVectorChange({ ...vector, z }) }),
  ])
};

const TransformNodeDetails = ({ editor, node }) => {
  const { onMetaChange, onNodeChange } = useNodeMetaChange(editor, node);
  
  return [
    h(NodeMetaDetails, { editor, meta: node.meta, onMetaChange }),
    h(VectorInput, {
      vector: node.position,
      onVectorChange: position => onNodeChange({ ...node, position }) })
  ]
}

const ModelInput = ({ modelId, models, onModelChange }) => {
  return [
    h(SelectEditor, {
      label: 'model',
      values: [...models.values()].map(m => ({
        value: m.id,
        title: m.title,
      })),
      selected: modelId,
      onSelectedChange: onModelChange,
    }),
  ]
};

const ModelNodeDetails = ({ editor, node }) => {
  const { onMetaChange, onNodeChange } = useNodeMetaChange(editor, node);
  return [
    h(NodeMetaDetails, { editor, meta: node.meta, onMetaChange }),
    h(ModelInput, {
      modelId: node.modelId,
      models: editor.resources.modelResources,
      onModelChange: modelId => onNodeChange({ ...node, modelId })
    })
  ]
}

const FloorNodeDetails = ({ editor, node }) => {
  const { onMetaChange, onNodeChange } = useNodeMetaChange(editor, node);
  return [
    h(NodeMetaDetails, { editor, meta: node.meta, onMetaChange }),
    h(VectorInput, {
      vector: node.floorShape.size,
      onVectorChange: size => onNodeChange({ ...node, floorShape: { ...node.floorShape, size } }) })
  ]
}

const CameraNodeDetails = ({ editor, node }) => {
  const { onMetaChange, onNodeChange } = useNodeMetaChange(editor, node);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const customProp = {
      ...editor.terrainProp,
      cameraNodeId: node.meta.id,
    };

    const [propObject, objectMap] = createTerrainPropGroup(customProp, editor.resources);
    const scene = new Scene();
    scene.add(propObject);
    const existingCamera = objectMap.get(node.meta.id)
    console.log(node, objectMap)
    const defaultCamera = new PerspectiveCamera();
    defaultCamera.position.set(10, 10, 10);
    defaultCamera.matrix.lookAt(defaultCamera.position, new Vector3(0, 0, 0), new Vector3(0, 1, 0));
    scene.add(defaultCamera);
    const camera = (existingCamera instanceof Camera && existingCamera) || defaultCamera;
    console.log(scene, existingCamera);
    
    const { promise, cancel } = editor.services.render.renderIcon(scene, camera);
    promise.then(iconResult => setUrl(iconResult.url))
    return () => cancel();
  }, [editor])

  return [
    h(NodeMetaDetails, { editor, meta: node.meta, onMetaChange }),
    url && h('img', { src: url })
  ]
}