// @flow strict

import {
  createAssetDownloadURLMap, getContentRenderData,
  SceneRenderer2, useMiniTheaterController2,
  useLibraryMiniTheaterResources,
  useAsync
} from "@astral-atlas/wildspace-components";
import { createMockEditingLayer, createMockLibraryData, createMockTerrainPlacement, createMockTerrainProp, createMockWildspaceClient, randomElement, randomIntRange, repeat } from "@astral-atlas/wildspace-test";
import { h, useEffect, useMemo, useState } from "@lukekaalim/act";
import { WidePage } from "../page";
import { ScaledLayoutDemo } from "../demo";
import simpleShapesURL from './simple_shapes.glb';
import { v4 } from "uuid";
import { Quaternion } from "three";

/*::
import type { Page } from "..";
import type { Component } from "@lukekaalim/act";
import type { ModelResource, AssetInfo } from '@astral-atlas/wildspace-models';
*/

const modelAsset/*: AssetInfo*/ = {
  description: { id: v4(), creator: '', MIMEType: 'model/gltf-binary', bytes: 0, name: '', uploaded: 0 },
  downloadURL: simpleShapesURL
}

const modelResource/*: ModelResource*/ = {
  assetId: modelAsset.description.id,
  format: 'gltf',
  id: v4(),
  name: '',
  previewCameraPath: null,
}
const basicShape = {
  type: 'box',
  position: { x: 0, y: 0, z: 0 },
  size: { x: 30, y: 10, z: 10 },
  rotation: { x: 0, y: 0, z: 0, w: 1 }
}
const cube = createMockTerrainProp(modelResource.id, ['Cube'], [basicShape], 'Cube');
const torus = createMockTerrainProp(modelResource.id, ['Torus'], [basicShape], 'Torus');
const cone = createMockTerrainProp(modelResource.id, ['Cone'], [basicShape], 'Cone');
const sphere = createMockTerrainProp(modelResource.id, ['Sphere'], [basicShape], 'Sphere');
const terrainProps = [
  cube,
  torus,
  cone,
  sphere
];
const quaternionToMini = q => ({
  x: q.x,
  y: q.y,
  z: q.z,
  w: q.w,
})
const layer = {
  ...createMockEditingLayer(),
  name: 'Custom Terrain',
  includes: [{ type: 'any-terrain' }]
};
const terrain = repeat(() =>
  createMockTerrainPlacement(
    randomElement(terrainProps).id,
    layer.id, null,
    quaternionToMini(new Quaternion().random()),
  ), randomIntRange(10, 2))

const basicLib = createMockLibraryData();
const originalTheater = basicLib.miniTheaters[0];
const initialLib = {
  ...basicLib,
  modelResources: [
    modelResource,
  ],
  assets: [
    ...basicLib.assets,
    modelAsset
  ],
  terrainProps,
  miniTheaters: [
    {
      ...originalTheater,
      terrain,
      layers: [...originalTheater.layers, layer]
    }
  ]
}
export const MiniTheaterSceneDemo/*: Component<>*/ = () => {
  const [library, setLibrary] = useState(initialLib);

  const assets = createAssetDownloadURLMap(library.assets)

  const client = createMockWildspaceClient(() => library, setLibrary);
  const resources = useLibraryMiniTheaterResources(library)
  const [updates] = useAsync(async () => client.updates.create('gameId'), [library]);

  const miniTheaterId = library.miniTheaters[0].id;

  const controller = useMiniTheaterController2(
    miniTheaterId,
    resources,
    updates,
    true,
  )
  const [miniTheaterState, setMiniTheaterState] = useState(null);
  useEffect(() => {
    if (!controller)
      return;
    const { unsubscribe } = controller.subscribe(setMiniTheaterState);
    return () => unsubscribe();
  }, [controller])




  const content = useMemo(() => ({
    type: 'mini-theater',
    miniTheaterId,
  }), [miniTheaterId]);

  const sceneContentRenderData = getContentRenderData(
    content,
    miniTheaterState,
    controller,
    assets);

  return [
    h(ScaledLayoutDemo, {}, [
      !!sceneContentRenderData &&
        h(SceneRenderer2, { sceneContentRenderData }),
    ])
  ];
};


export const miniTheaterScenePage/*: Page*/ = {
  content:
    h(WidePage, {},
        h(MiniTheaterSceneDemo)),
  link: {
    name: 'MiniTheater',
    href: '/scenes/mini-theater',
    children: [],
  }
}