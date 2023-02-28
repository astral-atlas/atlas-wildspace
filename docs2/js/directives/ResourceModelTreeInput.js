// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { ModelResourceTreeInput } from "@astral-atlas/wildspace-components"
import { h, useMemo, useState } from "@lukekaalim/act"
import { Mesh, BoxGeometry, Light, PerspectiveCamera } from "three";

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
    h(ModelResourceTreeInput, { modelObject, selectedObject, onSelectChange: setSelectedObject }),
    selectedObject && h('div', {}, [
      `Selected: ${selectedObject.name} (${selectedObject.uuid})`
    ])
  ]
}