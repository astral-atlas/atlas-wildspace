// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { ModelResourcePart } from '@astral-atlas/wildspace-models';
*/

import { ModelResourceEditorSection } from "@astral-atlas/wildspace-components";
import { h, useMemo, useState } from "@lukekaalim/act";
import { FramePresenter } from "./presentation";
import { BoxGeometry, Mesh } from "three";
import { createMockModelResource, randomName } from "@astral-atlas/wildspace-test";
import { nanoid } from "nanoid/non-secure";


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

  const resource = useMemo(() => createMockModelResource(), []);

  const [parts, setParts] = useState/*:: <ModelResourcePart[]>*/([])
  const events = (event) => {
    switch (event.type) {
      case 'add-part':
        const newPart = {
          gameId: '0',
          id: nanoid(),
          modelResourceId: resource.id,
          objectUuid: event.objectUUID,
          tags: [],
          visibility: { type: 'game-master-in-game' },
          title: '',
          version: nanoid(),
        }
        return setParts([...parts, newPart])
      case 'update-part':
        return setParts(parts.map(p => p.id === event.partId ? event.part : p));
      case 'remove-part':
        return setParts(parts.filter(p => p.id !== event.partId))
    }
  }

  return h(FramePresenter, { height: 'calc(512px + 256px)' },
    h(ModelResourceEditorSection, { events, modelObject, parts, resource }));
};