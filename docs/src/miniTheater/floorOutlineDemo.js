// @flow strict
/*::
import type { Component } from "@lukekaalim/act/component";
*/

import { FreeCamera, RenderCanvas, useChildObject } from "@astral-atlas/wildspace-components";
import { FloorOutline} from "@astral-atlas/wildspace-components/miniTheater/floor/FloorOutline";
import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { group } from "@lukekaalim/act-three";

import {
  Vector3,
  AxesHelper,
  Euler,
  Quaternion,
} from "three";
import { ScaledLayoutDemo } from "../demo";
import { GridHelperGroup } from "../controls/helpers";

export const FloorOutlineDemo/*: Component<>*/ = () => {
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