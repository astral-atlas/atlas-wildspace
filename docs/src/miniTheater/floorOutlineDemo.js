// @flow strict
/*::
import type { Component } from "@lukekaalim/act/component";
*/

import { FreeCamera, RenderCanvas, useChildObject } from "@astral-atlas/wildspace-components";
import { FloorOutline, floorRotatableUVs, getFloorUVs } from "@astral-atlas/wildspace-components/miniTheater/floor/FloorOutline";
import { writeArrayVector2s } from "@astral-atlas/wildspace-components/writeGeometry";
import { writeArrayQuadPositions, writeUVQuadPositions } from "@astral-atlas/wildspace-components/writeGeometry/writeTileMap";
import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { group, mesh, perspectiveCamera, useDisposable } from "@lukekaalim/act-three";
import floorURL from '@astral-atlas/wildspace-components/miniTheater/floor/floor_outline_4x4.png';

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  MeshBasicMaterial,
  PlaneGeometry,
  TextureLoader,
  Vector3,
  sRGBEncoding,
  FrontSide,
  AxesHelper,
  Euler,
  Quaternion,
} from "three";
import { ScaledLayoutDemo } from "../demo";
import { GridHelperGroup } from "../controls/helpers";

const floorOutlineTexture = new TextureLoader()
  .load(floorURL, console.log, console.info, console.error);
floorOutlineTexture.encoding = sRGBEncoding;

const geometry = new BufferGeometry()
const material = new MeshBasicMaterial({
  map: floorOutlineTexture,
  color: new Color('white'),
  transparent: true,
//  vertexColors: true,
  side: FrontSide
});

const cells = [
  new Vector3(-1, 0, -1),
  new Vector3(0, 0, -1),
  new Vector3(1, 0, -1),

  new Vector3(-1, 0, 0),
  new Vector3(0, 0, 0),
  new Vector3(1, 0, 0),

  new Vector3(-1, 0, 1),
  new Vector3(0, 0, 1),
  new Vector3(1, 0, 1),
]
const pos = new Float32Array(1 * 6 * 3);
writeArrayQuadPositions(pos, 0, new Vector3(0, 0, 0));

const uvs = new Float32Array([
  0, 0,
  0, 1,
  1, 1,

  0, 0,
  1, 1,
  1, 0
]);
writeUVQuadPositions(uvs, 0, getFloorUVs(new Vector3(0, 0, 0), []))

geometry.setAttribute('position', new BufferAttribute(pos, 3))
//geometry.setAttribute('color', new BufferAttribute(uvs, 2))
geometry.setAttribute('uv', new BufferAttribute(uvs, 2))


export const FloorOutlineDemo/*: Component<>*/ = () => {
  const cameraRef = useRef();
  const geometry = useDisposable(() => new BufferGeometry());

  const [upLeft, setUpLeft] = useState(false);
  const [up, setUp] = useState(false);
  const [upRight, setUpRight] = useState(false);

  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(false);

  const [downLeft, setDownLeft] = useState(false);
  const [down, setDown] = useState(false);
  const [downRight, setDownRight] = useState(false);

  const cells = useMemo(() => [
    upLeft &&   new Vector3(10, 0, 10) || null,
    up &&       new Vector3(0, 0, 10) || null,
    upRight &&  new Vector3(-10, 0, 10) || null,


    left && new Vector3(10, 0, 0) || null,
    new Vector3(0, 0, 0),
    right && new Vector3(-10, 0, 0) || null,

    downLeft &&   new Vector3(10, 0, -10) || null,
    down &&       new Vector3(0, 0, -10) || null,
    downRight &&  new Vector3(-10, 0, -10) || null,
  ].filter(Boolean), [
    upLeft,   up,   upRight,
    left,           right,
    downLeft, down, downRight
  ]);

  const [r, setR] = useState(0)
  const [i, setI] = useState(0) 
  const [z, setZ] = useState(0) 

  const ref = useRef()
  useChildObject(ref, () => new AxesHelper(5))


  return [
    h(ScaledLayoutDemo, {}, [
      h(RenderCanvas, { canvasProps: { style: { position: 'absolute', width: '100%', height: '100%' } } }, [
        h(FreeCamera, {
          position: new Vector3(0, 20, -20),
          quaternion: new Quaternion().setFromEuler(new Euler(-2.5, 0, -3.14)),
          onFreeCameraChange: console.log
        }),
        h(group, {
          ref,
          position: new Vector3(0, 1, 0),
        }),
        h(GridHelperGroup),
        h(FloorOutline, { cells, adjacentCells: cells })
      ]),
    ]),
    h('pre', {}, JSON.stringify([...uvs])),
    h('button', { onClick: () => setR((r+1) % 4) }, r),
    h('button', { onClick: () => setI((i+1) % 4) }, i),
    h('button', { onClick: () => setZ((z+2)) }, z),
    h('div', { style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 2rem)',
      gridTemplateRows: 'repeat(3, 2rem)',
    }}, [
      h('button', { onClick: () => setUpLeft(!upLeft) }, '0'),
      h('button', { onClick: () => setUp(!up) }, up ? 'O' : 'X'),
      h('button', { onClick: () => setUpRight(!upRight) }, '0'),

      h('button', { onClick: () => setLeft(!left) }, left ? 'O' : 'X'),
      h('button', { disabled: true }, '0'),
      h('button', { onClick: () => setRight(!right) }, right ? 'O' : 'X'),

      h('button', { onClick: () => setDownLeft(!downLeft) }, downLeft ? 'O' : 'X'),
      h('button', { onClick: () => setDown(!down) }, down ? 'O' : 'X'),
      h('button', { onClick: () => setDownRight(!downRight) }, downRight ? 'O' : 'X'),
    ])
  ];
}