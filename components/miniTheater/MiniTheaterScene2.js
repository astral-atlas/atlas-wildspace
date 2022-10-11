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
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "./useMiniTheaterController2";
*/
import { h, useContext, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { MiniTheaterPiecesRenderer } from "./MiniTheaterPiecesRenderer";
import { FloorMesh } from "./floor/FloorMesh";
import {
  miniQuaternionToThreeQuaternion,
  miniVectorToThreeVector,
} from "../utils/miniVector";
import { Matrix4, Quaternion, Vector3 } from "three";
import {
  useRaycast2,
  useRaycast3,
  useRaycastManager,
} from "../raycast/manager";
import { useRaycastElement } from "../raycast/useRaycastElement";
import { renderCanvasContext } from "../three/RenderCanvas";
import { useSimulateLoop } from "../three/useLoopController";
import { MiniTheaterCursorRenderer } from "./MiniTheaterCursorRenderer";
import { MiniTheaterTerrainRenderer } from "./terrain/MiniTheaterTerrainRenderer";
import { useRefMap, useRefMap2 } from "../editor";


const usePlacedTerrainFloors = (miniTheater, resources, layer) => {
  const floors = useMemo(() => {
    return miniTheater.terrain
      .map(terrainPlacement => {
        const placementLayer = miniTheater.layers.find(l => l.id === terrainPlacement.layer);
        if (placementLayer && !placementLayer.visible && (!layer || (layer.id !== placementLayer.id)))
          return [];

        const placementPosition = miniVectorToThreeVector(terrainPlacement.position);
        const placementRotation = miniQuaternionToThreeQuaternion(terrainPlacement.quaternion);

        const placementMatrix = new Matrix4().compose(placementPosition, placementRotation, new Vector3(1, 1, 1))

        const terrainProp = resources.terrainProps.get(terrainPlacement.terrainPropId);
        if (!terrainProp)
          return [];

        return terrainProp.floorShapes.map(floorShape => {
          const position = miniVectorToThreeVector(floorShape.position)
            .applyMatrix4(placementMatrix);
          const rotation = miniQuaternionToThreeQuaternion(floorShape.rotation)
            .multiply(placementRotation)

          
            
          return {
            ...floorShape,
            position: { x: position.x, y: position.y, z: position.z },
            rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w, },
          }
        })
      })
      .flat(1);
  }, [miniTheater.terrain, resources.terrainProps])

  return floors;
}

/*::
export type MiniTheaterScene2Props = {
  miniTheaterState: MiniTheaterLocalState,
  controller: ?MiniTheaterController2,

  
  onOverFloor?: (floorPoint: Vector3) => mixed,
  onExitFloor?: () => mixed,
}
*/

export const MiniTheaterScene2/*: Component<MiniTheaterScene2Props>*/ = ({
  miniTheaterState,
  controller,

  onOverFloor = _ => {},
  onExitFloor = () => {},
}) => {
  const layer = miniTheaterState.miniTheater.layers.find(l => l.id === miniTheaterState.layer);
  const isTerrainLayer = layer && layer.includes.some(i => i.type === 'any-terrain');
  const placedFloors = usePlacedTerrainFloors(
    miniTheaterState.miniTheater,
    miniTheaterState.resources,
    layer,
  )

  const characterFloors = useMemo(() => {
    return miniTheaterState.miniTheater.pieces
      .map(p => [
        {
          type: 'box',
          position: { x: p.position.x * 10, y: p.position.z * 10, z: p.position.y * 10 },
          size: { x: 10, y: 10, z: 10 },
          rotation: { x: 0, y: 0, z: 0, w: 1}
        },
      ])
      .flat(1)
  }, [miniTheaterState.miniTheater.pieces])
  const floors = useMemo(() => {
    return [
      ...placedFloors,
      ...characterFloors,
      isTerrainLayer ? {
        type: 'box',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        size: { x: 50, y: 10, z: 50 }
      } : null,
    ].filter(Boolean);
  }, [placedFloors, characterFloors, isTerrainLayer])

  const raycast = useRaycastManager();

  const includeRaycast = miniTheaterState.targetMode === 'pieces';
  const refMap = useRefMap2()
  useRaycast3(includeRaycast ? raycast : null, refMap, {
    over(intersection) {
      onOverFloor(intersection.point);
    },
    exit() {
      onExitFloor();
    }
  }, [floors, onOverFloor, onExitFloor, includeRaycast])
  
  const render = useContext(renderCanvasContext);
  if (!render)
    return null;

  useRaycastElement(raycast, render.canvasRef);
  useSimulateLoop(render.loop, () => {
    return (c, v) => {
      raycast.onUpdate(c.camera);
    }
  })

  return [
    // Cursor
    h(MiniTheaterCursorRenderer, { miniTheaterState }),
    // Floor
    h(FloorMesh, { floors, refMap, showDebug: isTerrainLayer }),
    // Terrain
    h(MiniTheaterTerrainRenderer, { miniTheaterState, controller, raycast }),
    h(MiniTheaterPiecesRenderer, { miniTheaterState })
  ];
};