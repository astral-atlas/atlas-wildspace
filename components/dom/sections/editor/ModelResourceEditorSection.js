// @flow strict

import { h, useState } from "@lukekaalim/act";
import styles from './ModelResourceEditorSection.module.css';

import { RenderCanvas } from "../../../three/RenderCanvas";
import { ModelResourceTreeInput, PreviewSidebarLayout } from "../../blocks";
import { Object3DDuplicate } from "../../../three";
import { FreeCamera } from "../../../camera/FreeCamera";
import { mesh, scene } from "@lukekaalim/act-three";
import { Mesh, MeshBasicMaterial, Vector3 } from "three";

/*::
import type { Component } from "@lukekaalim/act";
import type { Object3D } from "three";
import type {
  ModelResource,
  ModelResourcePart,
} from "@astral-atlas/wildspace-models";

export type ModelResourceEditorSectionProps = {
  modelObject: Object3D,
  resource: ModelResource,
  parts: ModelResourcePart[],

  client: any,
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
      object.children.map(object => h(MeshNode, { object, selected }))
    ]),
  ];
};

export const ModelResourceEditorSection/*: Component<ModelResourceEditorSectionProps>*/ = ({
  modelObject,
  resource,
  parts,
}) => {
  const [selected, setSelected] = useState(null)

  return h(PreviewSidebarLayout, {
    preview:
      h(RenderCanvas, { className: styles.previewCanvas }, [
        h(scene, {}, [
          h(FreeCamera, { position: new Vector3(0, 0, 100) }),
          h(MeshNode, { object: modelObject, selected }),
          //h(Object3DDuplicate, { target: modelObject, context: { materials: new Map() } }),
        ]),
      ]),
    topPane:
      h(ModelResourceTreeInput, {
        modelObject,
        selectedObject: selected,
        onSelectChange: setSelected
      }),
    bottomPane: selected && [
      selected.name,
      h('div', {}, JSON.stringify(selected.position))
    ]
  })
}