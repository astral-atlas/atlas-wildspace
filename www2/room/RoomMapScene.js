// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';
import { C } from '@lukekaalim/act-three';

import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";

const geo = new BoxGeometry(1, 1, 1);
const mat = new MeshBasicMaterial({ color: 'red' })
const mesh = new Mesh(geo);

export const SpinningZeroCube/*: Component<{ speed: number }>*/ = () => {
  return h(C.mesh, { geometry: geo, material: mat });
};