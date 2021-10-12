// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useState, useEffect, useMemo } from '@lukekaalim/act';
import { C } from '@lukekaalim/act-three';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Points,
  PointsMaterial,
} from "three";

export const StarfieldScene/*: Component<{}>*/ = () => {

  const [windowSize, setWindowSize] = useState({ x: window.innerWidth, y: window.innerHeight });
  useEffect(() => {
    window.addEventListener('resize', () => {
      setWindowSize({ x: window.innerWidth, y: window.innerHeight });
    });
  }, []);

  const [meshes, group] = useMemo(() => {
    const starFields = Array.from({ length: 10 }).map(() => {
      const material = new PointsMaterial({ color: 0xffffff70, size: 0.1 });
      const geometry = new BufferGeometry();
  
      const positions = Array.from({ length: 512 })
        .map(() => {
          const x = (Math.random() * 80) - 40;
          const y = (Math.random() * 80) - 40;
          const z = (Math.random() * 40) - 40;
          return [x, y, z]
        })
        .flat()
  
      const vertices = new Float32Array(positions);
  
      geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );
      const mesh = new Points(geometry, material);
      return mesh;
    }, []);
    const starfieldGroup = new Group();
    starfieldGroup.add(...starFields)    

    return [starFields, starfieldGroup];
  }, []);

  const onRender = (time) => {
    for (let i = 0; i < meshes.length; i++) {
      const t = (((time / 10000) + (i/meshes.length)) % 1);
      const b = Math.abs(Math.sin(t * Math.PI));
      const mesh = meshes[i];

      const { material } = mesh;
      if (material instanceof PointsMaterial) {
        material.size = b * 0.1;
        material.color = new Color(b, b, b);
      }
      mesh.position.z = (t * 40) - 20;
    }
  };

  return [
    h(C.three, { height: windowSize.y, width: windowSize.x, onRender }, [
      h(C.group, { group }),
    ])
  ]
};
