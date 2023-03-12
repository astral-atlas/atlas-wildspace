// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { ModelResourcePart } from '@astral-atlas/wildspace-models';
*/

import { ModelResourceEditorSection } from "@astral-atlas/wildspace-components";
import { h, useEffect, useMemo, useState } from "@lukekaalim/act";
import { FramePresenter } from "./presentation";
import { BoxGeometry, Mesh } from "three";
import { createMockModelResource, randomName, } from "@astral-atlas/wildspace-test";
import { nanoid } from "nanoid/non-secure";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { testModelURLs } from '@astral-atlas/wildspace-test/models'

export const ModelResourceEditorSectionDemo/*: Component<>*/ = () => {
  const [modelObject, setModelObject] = useState(null);
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(testModelURLs.gunTurret, (result) => {
      setModelObject(result.scene);
      console.log(result.scene)
    })
  }, []);

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
    !!modelObject && h(ModelResourceEditorSection, { events, modelObject, parts, resource }));
};