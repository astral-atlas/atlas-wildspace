// @flow strict

import { h, useEffect, useRef } from "@lukekaalim/act";
import { group } from "@lukekaalim/act-three";
import { Object3DDuplicate, useChildObject } from "../../three";
import { miniQuaternionToThreeQuaternion, miniVectorToThreeVector } from "../../utils";
import { ModelResourceObject } from "../../resources/ModelResourceObject";
import { getObject3DForModelResourcePath } from "../../resources/modelResourceUtils";
import { Box3Helper, Mesh, Vector3, BoxHelper, Color } from "three";
import { useRaycast2 } from "../../raycast";
import { TerrainPlacementEditor } from "./TerrainPlacementEditor";

/*::
import type { TerrainPlacement } from "@astral-atlas/wildspace-models";
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "../useMiniTheaterController2";
import type { MiniTheaterRenderResources } from "../useMiniTheaterResources";
import type { Component } from "@lukekaalim/act";
import type { RaycastManager } from "../../raycast/manager";

export type MiniTheaterTerrainRendererProps = {
  miniTheaterState: MiniTheaterLocalState,
  controller: ?MiniTheaterController2,
  raycast?: ?RaycastManager,
}
*/

export const MiniTheaterTerrainRenderer/*: Component<MiniTheaterTerrainRendererProps>*/ = ({
  miniTheaterState,
  controller,
  raycast
}) => {
  const { miniTheater, resources, selection, targetMode, terrainCursor } = miniTheaterState;
  const { terrain } = miniTheater;

  const includeRaycast = targetMode === 'terrain';

  const onTerrainEnter = (terrainId) => () => {
    if (!controller)
      return;
    controller.act({ type: 'move-terrain-cursor', terrainCursor: terrainId })
  }
  const onTerrainExit = () => {
    if (!controller)
      return;
    controller.act({ type: 'move-terrain-cursor', terrainCursor: null })
  }
  const onMoveTerrain = (terrainId) => (gizmo) => {
    if (!controller)
      return;
    controller.act({
      type: 'remote-action',
      remoteAction: { type: 'set-terrain', terrain: terrain.map(t => {
        if (t.id !== terrainId)
          return t;
        const worldPosition = gizmo.getWorldPosition(new Vector3());
        return {
          ...t,
          position: {
            x: worldPosition.x,
            y: worldPosition.z,
            z: worldPosition.y
          },
        }
      }) }
    })
  }

  return miniTheater.terrain.map(terrain => {
    return h(TerrainPlacementRenderer, {
      key: terrain.id,
      terrain,
      resources,
      selection,
      terrainCursor,
      onEnter: onTerrainEnter(terrain.id),
      onExit: onTerrainExit,
      onMoveTerrain: onMoveTerrain(terrain.id),
      raycast: includeRaycast ? raycast : null
    })
  });
}

const TerrainPlacementRenderer = ({
  terrain, resources, raycast,
  terrainCursor,
  selection,
  onEnter, onExit,
  onMoveTerrain
 }) => {
  const terrainProp = resources.terrainProps.get(terrain.terrainPropId);
  const modelResource = terrainProp && resources.modelResources.get(terrainProp.modelResourceId)
  const rootObject = modelResource && resources.objectMap.get(modelResource.assetId);


  if (!rootObject || !modelResource || !terrainProp)
    return null;

  const selected = selection.type === 'terrain-prop' && selection.terrainId === terrain.id;
  const hover = terrainCursor === terrain.id;

  const object = getObject3DForModelResourcePath(rootObject, terrainProp.modelPath);

  if (!object)
    return null;

  const ref = useRef();
  useRaycast2(raycast, ref, {
    enter(i) {
      onEnter()
    },
    exit() {
      onExit()
    }
  }, [raycast])

  const groupRef = useRef();
  useChildObject(groupRef, () => {
    if (!selected && !hover)
      return;

    const { current: object } = ref;
    if (!object)
      return;

    return new BoxHelper(object, selected ? new Color('white') : new Color('yellow'));
  }, [selected, hover, object])

  return [
    h(ModelResourceObject, {
      ref,
      object, showHiddenObjects: true,
      position: miniVectorToThreeVector(terrain.position), 
      quaternion: miniQuaternionToThreeQuaternion(terrain.quaternion),
      scale: new Vector3(1, 1, 1)
    }),
    h(group, { ref: groupRef }),
    selected && h(TerrainPlacementEditor, { parentRef: ref, onMoveTerrain })
  ];
}