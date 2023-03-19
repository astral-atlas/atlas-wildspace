// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type {
  ModelResourcePart, Tag,

  TerrainPropNode,
  TerrainPropNodes,
} from '@astral-atlas/wildspace-models';
*/

import { ModelResourceEditorSection, TerrainPropEditor2, useLibraryMiniTheaterResources } from "@astral-atlas/wildspace-components";
import { createContext, h, useEffect, useMemo, useState } from "@lukekaalim/act";
import { FramePresenter } from "../presentation";
import { BoxGeometry, Mesh } from "three";
import {
  createMockLibraryData,
  createMockModelResource,
  createMockModelResourcePart,
  
  createMockTag, createMockTerrainProp, randomElement, randomGameName, randomName, repeat
} from "@astral-atlas/wildspace-test";
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

  const [allTags, setTags] = useState/*:: <Tag[]>*/([])
  const [parts, setParts] = useState/*:: <ModelResourcePart[]>*/([])

  const onEvent = (event) => {
    switch (event.type) {
      case 'submit-new-tag':
        const newTag = { ...createMockTag(), title: event.tagTitle };
        setTags(ts => [...ts, newTag]);
        return setParts(ps => ps.map(p => p.id !== event.partId ? p : {
          ...p, tags: [...p.tags, newTag.id]
        }))
      case 'add-part':
        const newPart = { ...createMockModelResourcePart(), modelResourceId: resource.id, objectUuid: event.objectUUID }
        return setParts(ps => [...ps, newPart])
      case 'update-part':
        return setParts(ps => ps.map(p => p.id === event.partId ? event.part : p));
      case 'remove-part':
        return setParts(ps => ps.filter(p => p.id !== event.partId))
    }
  }

  return h(FramePresenter, { height: 'calc(512px + 256px)' },
    !!modelObject && h(ModelResourceEditorSection, { onEvent, modelObject, parts, resource, allTags }));
};

const createMockTerrainPropNode = ()/*: TerrainPropNode[]*/ => {
  const createMockMeta = () => ({
    id: nanoid(),
    name: randomGameName(),
    path: []
  })
  const createMockCameraNode = ()/*: TerrainPropNodes["camera"]*/ => ({
    type: 'camera',
    meta: createMockMeta()
  });
  const createMockPropNode = ()/*: TerrainPropNodes["prop"]*/ => ({
    type: 'prop',
    propId: nanoid(),
    meta: createMockMeta()
  });
  const createMockTransformNode = (depth)/*: TerrainPropNode[] */ => {
    const children = depth < 2 ? repeat(() => createNodes(depth + 1), 3).flat(1) : [];
    return [{
      type: 'transform',
      children: children.map(c => c.meta.id),
      position: { x: 0, y: 0, z: 0, },
      quaternion: { x: 0, y: 0, z: 0, w: 0 },
      meta: createMockMeta()
    }, ...children];
  };
  

  const createNodes = (depth = 0)/*: TerrainPropNode[]*/ => {
    switch (randomElement(['prop', 'camera', 'transform'])) {
      case 'prop':
        return [createMockPropNode()];
      case 'transform':
        return createMockTransformNode(depth);
      case 'camera':
        return [createMockCameraNode()];
      default:
        throw new Error();
    }
  }
  return createMockTransformNode(0);
};

export const TerrainPropEditorDemo/*: Component<>*/ = () => {
  const data = useMemo(() => createMockLibraryData(), [])
  const resources = useLibraryMiniTheaterResources(data);
  const tags = [];
  const terrainPropsNodes = useMemo(() =>
    repeat(() => createMockTerrainPropNode(), 3).flat(1),
    []
  )
  const terrainProp = {
    ...createMockTerrainProp(),
    nodes: terrainPropsNodes,
    rootNodes: terrainPropsNodes.map(n => n.meta.id)
  };

  return h(FramePresenter, { height: 'calc(512px + 256px)' },
    h(TerrainPropEditor2, { resources, tags, terrainProp })
  )
};