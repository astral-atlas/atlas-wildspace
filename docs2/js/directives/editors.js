// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { ModelResourceEditorSection } from "@astral-atlas/wildspace-components";
import { h } from "@lukekaalim/act";
import { FramePresenter } from "./presentation";
import { BoxGeometry, Mesh } from "three";
import { createMockModelResource, randomName } from "@astral-atlas/wildspace-test";


const modelObject = new Mesh();
modelObject.add(
  new Mesh().add(
    new Mesh(),
    new Mesh(),
  ),
  new Mesh(),
  new Mesh().add(
    new Mesh()
  ),
);
const changeRandomly = (object) => {
  object.name = randomName()
  object.geometry = new BoxGeometry(10, 10, 10)
  object.position.set(
    (Math.floor(Math.random() * 50)) - 25,
    (Math.floor(Math.random() * 50)) - 25,
    (Math.floor(Math.random() * 50)) - 25,
  );
  object.updateMatrix();
  for (const child of object.children)
    if (child instanceof Mesh)
      changeRandomly(child)
}
changeRandomly(modelObject);

export const ModelResourceEditorSectionDemo/*: Component<>*/ = () => {

  const parts = [];
  const resource = createMockModelResource();
  const client = {}

  return h(FramePresenter, { height: 'calc(512px + 256px)' },
    h(ModelResourceEditorSection, { client, modelObject, parts, resource }));
};