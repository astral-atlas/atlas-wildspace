// @flow strict

import { h } from "@lukekaalim/act";
import { mesh, sprite } from "@lukekaalim/act-three";
import { BoxGeometry, Vector2, Vector3 } from "three";
import { getPieceAssetId } from "./MiniTheaterPieceRenderer";

/*::
import type { MiniTheater } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
import type { MiniTheaterRenderResources } from "./useMiniTheaterResources";
*/

/*::
export type MiniTheaterPiecesRendererProps = {
  miniTheater: MiniTheater,
  resources?: ?MiniTheaterRenderResources,
}
*/

const cube = new BoxGeometry(10, 10, 10)
const center = new Vector2(0.5, 0)
const scale = new Vector3(10, 10, 10)

export const MiniTheaterPiecesRenderer/*: Component<MiniTheaterPiecesRendererProps>*/ = ({
  miniTheater,
  resources = null
}) => {
  return miniTheater.pieces.map(piece => {
    const position = new Vector3(piece.position.x, piece.position.z, piece.position.y);
    position.multiplyScalar(10);
    const assetId = resources && getPieceAssetId(piece.represents, resources);
    const pieceMaterial = assetId && resources && resources.materialMap.get(assetId);
    if (!pieceMaterial)
      return h(mesh, { geometry: cube, position });
    return h(sprite, { material: pieceMaterial, position, center, scale })
  })
};