// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { CubicBezierAnimation } from "@lukekaalim/act-curve";

import type { EncounterResources } from "../encounter/useResources";
import type { MiniTheaterController } from "./useMiniTheaterController";
import type { MiniTheaterRenderResources } from "./useMiniTheaterResources";
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "./useMiniTheaterController2";

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
  BoxGeometry,
  Color,
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
  miniTheaterState: MiniTheaterLocalState,
}
*/

const cube = new BoxGeometry(10, 2, 10);
const blue = new MeshBasicMaterial({ color: new Color('blue'), opacity: 0.2, transparent: true })

export const MiniTheaterCursorRenderer/*: Component<MiniTheaterCursorRendererProps>*/ = ({
  miniTheaterState,
}) => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  const { cursor } = miniTheaterState;

  if (!cursor)
    return null;

  const position = new Vector3(cursor.x * 10, (cursor.z * 10) - 3, cursor.y * 10);

  return h(mesh, { geometry: cube, position, material: blue });
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