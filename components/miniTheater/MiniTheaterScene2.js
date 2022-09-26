// @flow strict

/*::
import type {
  MiniTheater,
  Character,
  MonsterActorMask,
  TerrainProp,
} from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
import type { AssetDownloadURLMap } from "../asset/map";
import type { MiniTheaterRenderResources } from "./useMiniTheaterResources";
import type { FloorShape } from "./floor/FloorShapeEditor";
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "./useMiniTheaterController2";
*/
import { h, useEffect, useMemo, useState } from "@lukekaalim/act";
import { MiniTheaterPiecesRenderer } from "./MiniTheaterPiecesRenderer";
import { Quaternion, SpriteMaterial, TextureLoader, Vector3 } from "three";
import { useAsync } from "../utils/async";
import { MiniTheaterFloorMesh } from "./floor/MiniTheaterFloorMesh";
import { FloorShapeEditor } from "./floor/FloorShapeEditor";
import { FloorMesh } from "./floor/FloorMesh";
import {
  raycastManagerContext,
  useRaycast2,
  useRaycastManager,
} from "../raycast/manager";
import { useContext, useRef } from "@lukekaalim/act/hooks";
import { renderCanvasContext } from "../three";
import { useRaycastElement } from "../raycast/useRaycastElement";

/*::
export type MiniTheaterScene2Props = {
  miniTheater: MiniTheater,
  assets: AssetDownloadURLMap,
  characters?: $ReadOnlyArray<Character>,
  monsterMasks?: $ReadOnlyArray<MonsterActorMask>,
  terrains?: $ReadOnlyArray<TerrainProp>,
  c?: MiniTheaterController2,
}
*/

export const MiniTheaterScene2/*: Component<MiniTheaterScene2Props>*/ = ({
  miniTheater,
  assets,
  characters = [],
  monsterMasks = [],
  terrains = [],
  c,
}) => {
  const [resources] = useAsync/*:: <MiniTheaterRenderResources>*/(async () => {
    const textureLoader = new TextureLoader();
    const texturesAssetInfo = [
      characters
        .map(c => c.initiativeIconAssetId),
      monsterMasks
        .map(m => m.initiativeIconAssetId)
    ]
      .flat(1)
      .map(id => id && assets.get(id) || null)
      .filter(Boolean);

    const textureMap = new Map(
      await Promise.all(
        texturesAssetInfo
          .map(async assetInfo => [
            assetInfo.description.id,
            await textureLoader.loadAsync(assetInfo.downloadURL)
          ])
      )
    );

    const materialMap = new Map([
      [
        ...characters.map(c => c.initiativeIconAssetId),
        ...monsterMasks.map(m => m.initiativeIconAssetId),
      ]
        .filter(Boolean)
        .map(assetId => [
          assetId,
          new SpriteMaterial({ map: textureMap.get(assetId) })
        ])
    ].flat(1));

    return {
      characters: new Map(characters.map(c => [c.id, c])),
      assets,
      materialMap,
      textureMap,
      meshMap: new Map(),
      monsterMasks: new Map(monsterMasks.map(m => [m.id, m])),
    };
  }, [])

  const [floor, setFloor] = useState/*:: <FloorShape>*/(() => {
    const size = new Vector3(10, 10, 10);
    const quaternion = new Quaternion().identity();
    const position = new Vector3(0, 0, 0);
    return { type: 'box', position, quaternion, size }
  });
  const onFloorChange = (nextFloor) => {
    setFloor(nextFloor);
  };
  
  const floors = useMemo(() => {
    return [floor];
  }, [floor])

  const raycast = useRaycastManager();
  const render = useContext(renderCanvasContext);
  if (!render)
    return null;
  useRaycastElement(raycast, render.canvasRef);

  useEffect(() => {
    return render.loop.subscribeSimulate((c, v) => {
      raycast.onUpdate(c.camera);
    })
  }, [render, raycast])

  const floorRef = useRef();
  useRaycast2(raycast, floorRef, {
    click() {
      console.log('CLICK')
    },
    over(e) {
      if (!c)
        return;

      const p = e.point.clone().multiplyScalar(0.1).round();
      c.act({ type: 'move-cursor', cursor: { x: p.x, y: p.y, z: p.z } })
    }
  });
  useEffect(() => {
    if (!c)
      return;
    const { unsubscribe } =  c.subscribe(console.log)
    return () => unsubscribe();
  }, [c])

  return [
    h(raycastManagerContext.Provider, { value: raycast }, [
      //h(MiniTheaterFloorMesh, { miniTheater }),
      h(FloorShapeEditor, { floor, onFloorChange }),
      //h(FloorShapeEditor, { floor: floorB, onFloorChange: onFloorBChange }),
      h(FloorMesh, { floors, ref: floorRef }),
      // Terrain
      h(MiniTheaterPiecesRenderer, { miniTheater, resources })
      // Cursor
    ])
  ];
};