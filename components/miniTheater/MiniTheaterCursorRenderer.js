// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { CubicBezierAnimation } from "@lukekaalim/act-curve";

import type { EncounterResources } from "../encounter/useResources";
import type { MiniTheaterController } from "./useMiniTheaterController";
import type { MiniTheaterRenderResources } from "./useMiniTheaterResources";
*/

import { h, useContext, useEffect, useRef, useState } from "@lukekaalim/act";
import { mesh, sprite } from "@lukekaalim/act-three";
import {
  MeshBasicMaterial,
  AdditiveBlending,
  SpriteMaterial,
  TextureLoader,
  Vector2,
  Vector3,
} from "three";

import { useDisposable } from "@lukekaalim/act-three/hooks";
import {
  useAnimatedNumber,
  useBezierAnimation,
} from "@lukekaalim/act-curve";
import { useAnimatedVector2, useBezier2DAnimation } from "../animation/2d";
import {
  MiniTheaterPieceRenderer,
  getPieceAssetId,
} from "./MiniTheaterPieceRenderer";
import { MiniTheaterSprite } from "./MiniTheaterSprite";

/*::
export type MiniTheaterCursorRendererProps = {
  controller: MiniTheaterController,
  resources: MiniTheaterRenderResources,
}
*/

export const MiniTheaterCursorRenderer/*: Component<MiniTheaterCursorRendererProps>*/ = ({
  controller,
  resources,
}) => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  return null;
  const material = useDisposable(() => {
    return new MeshBasicMaterial({
      map: texture,
      transparent: true,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
  }, [texture]);

  const [visibilityAnim] = useAnimatedNumber(visible ? 1 : 0, visible ? 1 : 0, { duration: 100, impulse: 3 })

  useBezierAnimation(visibilityAnim, point => {
    material.opacity = point.position * 0.8;
  })

  useEffect(() => {
    const { current: cursorMesh } = ref;
    if (!cursorMesh)
      return;

    return controller.subscribeCursor(cursor => {
      if (!cursor)
        return setVisible(false);

      setVisible(true);
      cursorMesh.position.set(
        cursor.position.x * 10,
        cursor.position.z * 10,
        cursor.position.y * 10
      )
    })
  }, [controller])

  const [placement, setPlacement] = useState(null)
  useEffect(() => {
    return controller.subscribePlacement(setPlacement)
  }, [])


  return [
    h(mesh, { geometry, material, ref, controller }, [
      !!placement && h(PlacementIndicator, { placement, resources })
    ]),
  ];
}

const PlacementIndicator = ({ resources, placement }) => {
  const material = useDisposable(() => new SpriteMaterial(), []);

  const assetId = getPieceAssetId(placement.placement, resources);

  useEffect(() => {
    const asset = !!assetId && resources.assets.get(assetId);
    if (!asset)
      return;
    const texture = new TextureLoader().load(asset.downloadURL);
    material.map = texture;
    return () => {
      texture.dispose();
    }
  }, [assetId, resources.assets])
  
  return h(sprite, {
    material,
    scale: new Vector3(10, 10, 10),
    center: new Vector2(0.5, 0),
    position: new Vector3(0, 10, 0)
  })
}

const CursorMesh = ({ entryAnim, resources, controller }) => {
}