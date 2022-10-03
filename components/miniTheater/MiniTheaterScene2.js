// @flow strict

/*::
import type {
  MiniTheater,
  Character,
  MonsterActorMask,
  TerrainProp,
} from "@astral-atlas/wildspace-models";
import type { Vector3 } from "three";
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
import { Quaternion } from "three";
import { useRaycast2, useRaycastManager } from "../raycast/manager";
import { useRaycastElement } from "../raycast/useRaycastElement";
import { renderCanvasContext } from "../three/RenderCanvas";
import { useSimulateLoop } from "../three/useLoopController";
import { MiniTheaterCursorRenderer } from "./MiniTheaterCursorRenderer";
import { MiniTheaterTerrainRenderer } from "./terrain/MiniTheaterTerrainRenderer";


const usePlacedTerrainFloors = (miniTheater, resources) => {
  const floors = useMemo(() => {
    return miniTheater.terrain
      .map(terrainPlacement => {
        const placementPosition = miniVectorToThreeVector(terrainPlacement.position);
        const placementRotation = miniQuaternionToThreeQuaternion(terrainPlacement.quaternion);

        const terrainProp = resources.terrainProps.get(terrainPlacement.terrainPropId);
        if (!terrainProp)
          return [];

        return terrainProp.floorShapes.map(floorShape => {
          const position = miniVectorToThreeVector(floorShape.position)
            .add(placementPosition);
          const rotation = miniQuaternionToThreeQuaternion(floorShape.rotation)
            .multiply(placementRotation);
            
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
  const placedFloors = usePlacedTerrainFloors(
    miniTheaterState.miniTheater,
    miniTheaterState.resources
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
    return [...placedFloors, ...characterFloors];
  }, [placedFloors, characterFloors])

  const floorRef = useRef();
  const raycast = useRaycastManager();

  const includeRaycast = miniTheaterState.targetMode === 'pieces';
  useRaycast2(includeRaycast ? raycast : null, floorRef, {
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
    h(FloorMesh, { floors, ref: floorRef }),
    // Terrain
    h(MiniTheaterTerrainRenderer, { miniTheaterState, controller, raycast }),
    h(MiniTheaterPiecesRenderer, { miniTheaterState })
  ];
};