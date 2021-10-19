// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useEffect, useRef, useState } from '@lukekaalim/act';
import { C } from '@lukekaalim/act-three';
import { useCurves } from '@lukekaalim/act-curve';

import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";

const geo = new BoxGeometry(1, 1, 1);
const mat = new MeshBasicMaterial({ color: 'red' })
const mesh = new Mesh(geo);

export const SpinningZeroCube/*: Component<{ speed: number }>*/ = () => {
  const [rotation, setRotation] = useState/*:: <number>*/((Math.PI / 4));
  const ref = useRef();

  useEffect(() => {
    const onKeyPress = (event/*: KeyboardEvent*/) => {
      switch (event.key) {
        case 'ArrowLeft':
          return setRotation(r => r + (Math.PI / 2));
        case 'ArrowRight':
          return setRotation(r => r - (Math.PI / 2));
      }
    };
    document.addEventListener('keydown', onKeyPress);
    return () => {
      document.removeEventListener('keydown', onKeyPress);
    }
  }, []);

  useCurves({ rotation }, ({ rotation }) => {
    const { current: mesh } = ref;
    if (!mesh)
      return;
    mesh.rotation.y = rotation;
  }, { duration: 1000 })

  return h(C.mesh, { geometry: geo, material: mat, ref });
};