// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { ModelResourceObjectInput, ModelResourceTreeInput } from "@astral-atlas/wildspace-components"
import { createMockModelResource, createMockModelResourcePart } from "@astral-atlas/wildspace-test";
import { h, useMemo, useState } from "@lukekaalim/act"
import { Mesh, BoxGeometry, Light, PerspectiveCamera } from "three";
import { FramePresenter } from "./presentation";

export const ResourceModelTreeInputDemo/*: Component<>*/ = () => {
  const [selectedObject, setSelectedObject] = useState(null)

  const modelObject = useMemo(() => {
    const root = new Mesh();
    root.name = "Root Object";
    const childA = new Mesh();
    childA.name = "Cool Mesh";
    const childB = new Light();
    childB.name = "Cool Light";
    const childC = new PerspectiveCamera();
    childC.name = "Cool PerspectiveCamera";
    
    root.add(childB, childA);
    childB.add(childC);

    return root;
  }, [])

  return [
    h(FramePresenter, {}, [
      h(ModelResourceTreeInput, {
        modelObject,
        selectedObject, 
        onSelectChange: setSelectedObject,
        parts: []
      }),
      selectedObject && h('div', {}, [
        `Selected: ${selectedObject.name} (${selectedObject.uuid})`
      ])
    ]),
  ]
}

export const ResourceModelObjectInputDemo/*: Component<>*/ = () => {
  const [modelResource, modelObject] = useMemo(() => {
    const modelResource = createMockModelResource()
    const modelObject = new Mesh();;
    return [modelResource, modelObject]
  }, []);

  const [parts, setParts] = useState([]);

  return h(FramePresenter, {}, [
    h(ModelResourceObjectInput, {
      modelResource,
      parts: parts.map(p => ({ ...p, modelResourceId: modelResource.id, objectUuid: modelObject.uuid })),
      object: modelObject,
      onPartCreate: () => setParts([...parts, createMockModelResourcePart()]),
      onPartRemove: (id) => setParts(parts.filter(p => p.id !== id))
    })
  ]);
}