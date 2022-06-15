// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useRef } from '@lukekaalim/act';
import { points, useAnimationFrame, useDisposable } from "@lukekaalim/act-three";

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  PointsMaterial,
  Vector3,
} from "three";

/*::
export type WildspaceStarfieldSceneProps = {

};
*/


export const WildspaceStarfieldScene/*: Component<WildspaceStarfieldSceneProps>*/ = () => {
  return [
    h(ScrollingStarfield, { offset: 0 }),
    h(ScrollingStarfield, { offset: 100 }),
    h(ScrollingStarfield, { offset: 200 }),
    h(ScrollingStarfield, { offset: 300 }),
    h(ScrollingStarfield, { offset: 500 }),
    h(ScrollingStarfield, { offset: 600 }),
    h(ScrollingStarfield, { offset: 700 }),
  ];
};


const ScrollingStarfield = ({ offset }) => {

  const material = useDisposable(() => {
    const material = new PointsMaterial({ color: 'white', size: 1 });
    return material;
  }, [])
  const geometry = useDisposable(() => {
    const geometry = new BufferGeometry();
    const positions = Array.from({ length: 512 })
      .map(() => {
        const x = (Math.random() * 512) - 256;
        const y = (Math.random() * 512) - 256;
        const z = (Math.random() * 200) - 100;
        return [x, y, z]
      })
      .flat()
    const vertices = new Float32Array(positions);

    geometry.setAttribute( 'position', new BufferAttribute(vertices, 3) );
    return geometry;
  }, [])

  const ref = useRef();
  useAnimationFrame((now, delta) => {
    const { current: points } = ref;
    if (!points)
      return;

    const progress = ((now * 100 / 1000) + offset) % 600
    const b = Math.abs(Math.sin((progress / 600) * Math.PI));
    points.position.z = -600 + progress
    //points.rotation.z = b;

    material.size = b * 1.3;
    if (material.color instanceof Color)
        material.color.setRGB(b, b, b);
  }, [])

  return [
    h(points, { ref, geometry, material })
  ]
};