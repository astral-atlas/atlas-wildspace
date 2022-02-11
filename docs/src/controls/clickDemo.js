// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { BufferGeometry } from 'three'; */

import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { mesh, perspectiveCamera, scene, useRenderLoop, useResizingRenderer, useWebGLRenderer } from "@lukekaalim/act-three";

import { BoxGeometry, MeshBasicMaterial, Vector3, Euler, Color } from "three";

import styles from './index.module.css';
import { useClickRayContextValue, useClickRay, clickRayContext } from "./click.js";

export const ClickDemo/*: Component<>*/ = () => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();

  const [value, onClick] = useClickRayContextValue(cameraRef);

  const renderer = useWebGLRenderer(canvasRef);
  useRenderLoop(renderer, cameraRef, sceneRef);
  const canvasSize = useResizingRenderer(canvasRef, renderer);

  useEffect(() => {
    const { current: camera } = cameraRef;
    if (!camera)
      return;
    camera.lookAt(new Vector3(0, 0, 0));
  }, []);
  useEffect(() => {
    const { current: camera } = cameraRef;
    if (!camera || !canvasSize)
      return;
    camera.fov = 40;
    camera.aspect = canvasSize.x / canvasSize.y;
    camera.updateProjectionMatrix();
  }, [canvasSize])

  return [
    h('canvas', { ref: canvasRef, onClick, class: styles.demoCanvas, tabIndex: 0 }),
    h(clickRayContext.Provider, { value }, [
      h(scene, { ref: sceneRef }, [
        h(perspectiveCamera, {
          ref: cameraRef,
          position: new Vector3(0, -10, -10),
        }),
        Array.from({ length: 9 })
          .map((_, index) => (
            h(MyBox, { position: new Vector3(
              ((index % 3) - 1) * 3,
              (Math.floor((index / 3)) - 1) * 3,
              0
            ) })
          )),
      ])
    ]),
  ]
}

const boxGeometry = new BoxGeometry(2, 2, 2);

const MyBox = ({ position }) => {
  const ref = useRef();

  useClickRay(ref, (event, intersection, allIntersections) => {
    if (intersection !== allIntersections[0])
      return;
    event.preventDefault();
    materialRef.current.color = new Color(`hsl(${Math.random() * 255}, 75%, 75%)`)
  });

  const materialRef = useRef(new MeshBasicMaterial({ color: 'yellow' }))

  return [
    h(mesh, {
      ref,
      position,
      geometry: boxGeometry,
      material: materialRef.current
    })
  ];
};