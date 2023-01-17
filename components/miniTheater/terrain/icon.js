// @flow strict
/*::
import type { TerrainProp, TerrainPropID } from "@astral-atlas/wildspace-models";
import type { MiniTheaterRenderResources } from "../useMiniTheaterResources";
import type { Component } from "@lukekaalim/act/component";
import type { ThreeController } from "../../controllers/threeController";
*/
import { createTerrainPropObject } from "./terrainProp";
import { createTransformMatrixForTerrainPropNode } from "./transform";
import { PerspectiveCamera, Scene, Vector3 } from "three";
import { h, useEffect, useState } from "@lukekaalim/act";

export const createIconForTerrainProp = (
  prop/*: TerrainProp*/,
  resources/*: MiniTheaterRenderResources*/,
  three/*: ThreeController*/
)/*: null | { promise: Promise<{ url: string, propId: TerrainPropID }>, cancel: () => void }*/ => {
  const { iconCameraId } = prop;
  if (!iconCameraId)
    return null;

  const object = createTerrainPropObject(prop, resources);

  const camera = new PerspectiveCamera();
  camera.matrix.copy(createTransformMatrixForTerrainPropNode(prop, iconCameraId))

  const scene = new Scene();
  scene.add(object, camera);

  const iconResult = three.renderIcon(scene, camera);
  const cancel = () => {
    iconResult.cancel();
    iconResult.promise.then(icon => icon.dispose())
  }
  return {
    promise: iconResult.promise
      .then(({ url }) => ({ url, propId: prop.id })),
    cancel
  };
}

/*::
export type TerrainPropIconProps = {
  prop: TerrainProp,
  resources: MiniTheaterRenderResources,
  three: ThreeController
};
*/

const useTerrainPropIcon = () => {

};

export const TerrainPropIcon/*: Component<TerrainPropIconProps>*/ = ({ prop, resources, three }) => {
  const [iconURL, setIconURL] = useState(null);

  useEffect(() => {
    const iconWork = createIconForTerrainProp(prop, resources, three)
    if (!iconWork)
      return;
    const { cancel, promise } = iconWork;
    promise.then(r => setIconURL(r.url));
    return () => cancel();
  }, [prop, resources, three]);

  return h('img', { src: iconURL });
}