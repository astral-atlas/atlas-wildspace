// @flow strict

import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import styles from './ModelResourceEditorSection.module.css';

import { RenderCanvas } from "../../../three/RenderCanvas";
import { GameWindowOverlayAnchor, GameWindowOverlayBox, GameWindowOverlayLayout, ModelResourceObjectInput, ModelResourceTreeInput, PreviewSidebarLayout } from "../../blocks";
import { FreeCamera } from "../../../camera/FreeCamera";
import { group, lineSegments, mesh, scene, useDisposable } from "@lukekaalim/act-three";
import {
  Box3,
  BoxGeometry,
  BoxHelper,
  EdgesGeometry,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  Color,
} from "three";

/*::
import type { Component } from "@lukekaalim/act";
import type { Object3D } from "three";
import type {
  ModelResource,
  ModelResourcePart,
  ModelResourcePartID,
} from "@astral-atlas/wildspace-models";

export type ModelResourceEditorSectionProps = {
  modelObject: Object3D,
  resource: ModelResource,
  parts: ModelResourcePart[],

  events?: (
    | { type: 'add-part', objectUUID: string }
    | { type: 'remove-part', partId: ModelResourcePartID }
    | { type: 'update-part', partId: ModelResourcePartID, part: ModelResourcePart }
  ) => mixed,
};
*/
const selectedMaterial = new MeshBasicMaterial({ color: 'red' })
const unSelectedMaterial = new MeshBasicMaterial({ color: 'blue' })

const MeshNode = ({ object, selected }) => {
  if (!(object instanceof Mesh))
    return null;

  const isSelected = selected === object;

  return [
    h(mesh, {
      geometry: object.geometry,
      material: isSelected ? selectedMaterial : unSelectedMaterial,
      position: object.position
    },[
      object.children.map(object => h(MeshNode, { object, selected })),
    ]),
  ];
};

const findPath = (rootObject, targetObject, parentPath) => {
  const currentPath = [...parentPath, rootObject.uuid];
  if (rootObject === targetObject)
    return currentPath;

  if (rootObject.children.length < 1)
    return null;

  return rootObject.children
    .map(child => findPath(child, targetObject, currentPath))
    .find(Boolean)
}

const HighlightNode = ({ object }) => {
  const worldPosition = object.getWorldPosition(new Vector3());
  const [geometry, setGeometry] = useState(null);
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const box = new Box3();
    // $FlowFixMe
    box.setFromObject(object);
    const size = box.getSize(new Vector3());
    const position = box.getCenter(new Vector3());
    const geometry = new BoxGeometry(size.x, size.y, size.z);
    const edges = new EdgesGeometry(geometry);
    setGeometry(edges);
    setPosition(position);
    
    return () => {
      edges.dispose();
      geometry.dispose();
    };
  }, [object.uuid]);

  return geometry && position && h(lineSegments, {
    geometry,
    position,
  });
}

export const ModelResourceEditorSection/*: Component<ModelResourceEditorSectionProps>*/ = ({
  modelObject,
  resource,
  parts,

  events = _ => {},
}) => {
  const [selected, setSelected] = useState/*:: <null | Object3D>*/(null)

  return h(PreviewSidebarLayout, {
    preview: [
      h(RenderCanvas, { className: styles.previewCanvas }, [
        h(scene, {}, [
          h(FreeCamera, { position: new Vector3(0, 0, 100) }),
          h(MeshNode, { object: modelObject, selected }),
          !!selected && h(HighlightNode, { object: selected }),
          //h(Object3DDuplicate, { target: modelObject, context: { materials: new Map() } }),
        ]),
      ]),
      h(GameWindowOverlayLayout, {}, [
        h(GameWindowOverlayAnchor, { ha: 'left', va: 'top' }, [
          h(GameWindowOverlayBox, {}, [
            h('div', {}, `Click to focus`),
            h('div', {}, `Use WASD and mouse to move camera`),
          ])
        ])
      ]),
    ],
    topPane:
      h(ModelResourceTreeInput, {
        parts,
        modelObject,
        selectedObject: selected,
        onSelectChange: setSelected
      }),
    bottomPane: selected && [
      h(ModelResourceObjectInput, {
        object: selected,
        parts,
        modelResource: resource,
        onPartCreate: () => events({ type: 'add-part', objectUUID: selected.uuid }),
        onPartRemove: (partId) => events({ type: 'remove-part', partId }),
        onPartUpdate: (partId, part) => events({ type: 'update-part', partId, part })
      }),
    ]
  })
}