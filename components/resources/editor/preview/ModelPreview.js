// @flow strict

import { h } from "@lukekaalim/act";
import { group, mesh } from "@lukekaalim/act-three";
import { Mesh, Object3D } from "three";

/*::
import type { EditorData } from "../editorData";
import type { Component } from "@lukekaalim/act";

export type ModelPreviewProps = {
  editor: EditorData,
}
*/

export const ModelPreview/*: Component<ModelPreviewProps>*/ = ({ editor }) => {
  
  return [
    h(Node, { node: editor.object, editor })
  ];
}

const Node = ({ node, editor }) => {
  const children = node.children
    .map(child => h(Node, { node: child, editor }));
  
  const transformProps = {
    position: node.position,
    quaternion: node.quaternion,
    scale: node.scale
  };

  if (node instanceof Mesh) {
    const { material, geometry } = node;
    return h(mesh, {
      ...transformProps,
      geometry,
      material: Array.isArray(material) ? material[0] : material,
      visible: node.visible
    }, children)
  }
  
  return h(group, { ...transformProps }, children);
};