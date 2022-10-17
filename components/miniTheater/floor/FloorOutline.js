// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { ReadOnlyRef } from "../../three/useChildObject";
import type { Mesh, Object3D } from "three";
*/
import floorOutlineTextureURL from './floor_outline_2x2.png';

import {
  MeshBasicMaterial,
  TextureLoader,
  Vector2,
  sRGBEncoding,
  BufferGeometry,
  BufferAttribute,
  Vector3,
  NearestFilter,
  NearestMipmapNearestFilter,
  AxesHelper,
} from "three";
import { calculate2dQuadUVs, writeArrayQuadPositions, writeUVQuadPositions } from '../../writeGeometry/writeTileMap';
import { group, lineSegments, mesh, useDisposable } from '@lukekaalim/act-three';
import { h, useEffect, useRef } from '@lukekaalim/act';
import { useChildObject } from "../../three/useChildObject";

const floorOutlineTexture = new TextureLoader()
  .load(floorOutlineTextureURL, texture => {
    texture.encoding = sRGBEncoding;
    //texture.offset = new Vector2(-0.5/1024, -0.5/1024);
    //texture.magFilter = NearestMipmapNearestFilter;
    //texture.minFilter = NearestMipmapNearestFilter;
  });

const floorOutlineMaterial = new MeshBasicMaterial({
  transparent: true,
  map: floorOutlineTexture,
  writeDepth: false,
  readDepth: false,
  color: 'rgb(128, 179, 238)',
});
const floorOutlineSize = new Vector2(1/4, 1/4);

const getFloorQuadrantUVs = (
  cell/*: Vector3*/,
  cells/*: Vector3[]*/,
  subcellX/*: number*/,
  subcellY/*: number*/,
)/*: Vector2[]*/ => {
  const upLeft =      cells.some(c => c.x === (cell.x + 10) && c.y === cell.y && c.z === (cell.z + 10));
  const up =          cells.some(c => c.x === (cell.x + 0) && c.y === cell.y && c.z === (cell.z + 10));
  const upRight =     cells.some(c => c.x === (cell.x - 10) && c.y === cell.y && c.z === (cell.z + 10));

  const left =        cells.some(c => c.x === (cell.x + 10) && c.y === cell.y && c.z === (cell.z + 0));
  const right =       cells.some(c => c.x === (cell.x - 10) && c.y === cell.y && c.z === (cell.z + 0));

  const downLeft =    cells.some(c => c.x === (cell.x + 10) && c.y === cell.y && c.z === (cell.z - 10));
  const down =        cells.some(c => c.x === (cell.x + 0) && c.y === cell.y && c.z === (cell.z - 10));
  const downRight =   cells.some(c => c.x === (cell.x - 10) && c.y === cell.y && c.z === (cell.z - 10));

  switch (true) {
    // top left
    case subcellX === 1 && subcellY === 1:
      return getFloorCornerUVs(left, upLeft, up, 0);
    // top right
    case subcellX === 0 && subcellY === 1:
      return getFloorCornerUVs(up, upRight, right, 1);
    // bottom right
    case subcellX === 0 && subcellY === 0:
      return getFloorCornerUVs(right, downRight, down, 2);
    // bottom left
    case subcellX === 1 && subcellY === 0:
      return getFloorCornerUVs(down, downLeft, left, 3);
  }
  throw new Error();
}

const tileOrientations = [
  0, 1, 2, 3
]

const tileIndicies = [
  new Vector2(0, 3),
  new Vector2(1, 3),
  new Vector2(0, 2),
  new Vector2(1, 2),
].map(tileOffset =>
  tileOrientations.map(r =>
    calculate2dQuadUVs(tileOffset, floorOutlineSize, r, 1/8)))

const reverseTileIndicies = tileIndicies.map(tis =>
  tis.map(tileIndieciesPerRotation => 
    [...tileIndieciesPerRotation].reverse()))

const mod = (a, b) => ((a % b) + b) % b;

const getFloorCornerUVs = (
  left,
  outside,
  right,
  rotation,
) => {
  if (!left && !right)
    return tileIndicies[0][rotation];
  if (left && !right)
    return tileIndicies[1][rotation];
  if (!left && right)
    return reverseTileIndicies[1][mod(-rotation + 1, 4)];
  if (left && right && outside)
    return tileIndicies[3][rotation];
  if (left && right && !outside)
    return tileIndicies[2][rotation];

  throw new Error();
}

/*::
export type FloorOutlineProps = {
  position?: Vector3,
  cells: Vector3[],
  adjacentCells: Vector3[],
  ref?: Ref<?Mesh>,
}
*/
export const FloorOutline/*: Component<FloorOutlineProps>*/ = ({
  position = new Vector3(0, 0, 0),
  cells,
  adjacentCells,
  ref,
}) => {
  const geometry = useDisposable(() => {
    return new BufferGeometry()
  });
  useEffect(() => {
    const pos = new Float32Array(cells.length * 6 * 3 * 4);
    const uvs = new Float32Array(cells.length * 6 * 2 * 4);
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const subcell = cell.clone();
      for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 2; y++) {
          subcell.set(
            cell.x + (x*5) - 2.5,
            cell.y,
            cell.z + (y*5) - 2.5
          )
          const quadIndex = (x * 2) + y;
          writeArrayQuadPositions(pos, (i * 4 * 3 * 6) + (quadIndex * 3 * 6), subcell, 2.5);
          writeUVQuadPositions(uvs, (i * 4 * 2 * 6) + (quadIndex * 2 * 6), getFloorQuadrantUVs(cell, adjacentCells, x, y))
        }
      }
    }
    geometry.setAttribute('position', new BufferAttribute(pos, 3))
    geometry.setAttribute('uv', new BufferAttribute(uvs, 2))
    geometry.translate(0, -4.5, 0);
    geometry.translate(-position.x, -position.y, -position.z);
  }, [cells, adjacentCells])

  const localRef = useRef();
  useChildObject(localRef, () => new AxesHelper(), []);

  return [
    h(mesh, {
      position,
      geometry,
      material: floorOutlineMaterial,
      ref: ref || undefined,
    }),
    h(group, { ref: localRef, position, scale: new Vector3(10, 10, 10) })
  ]
};