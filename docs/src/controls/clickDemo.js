// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { BufferGeometry } from 'three'; */

import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { mesh, perspectiveCamera, scene, useRenderLoop, useResizingRenderer, useWebGLRenderer } from "@lukekaalim/act-three";

import { BoxGeometry, MeshBasicMaterial, Vector3, Euler, Color } from "three";

import styles from './index.module.css';
import { useClickRayContextValue, useClickRay, clickRayContext } from "./click.js";
import { useRaycastManager, useRaycast, raycastManagerContext } from "./raycast.js";
import { useAnimation } from "@lukekaalim/act-curve/animation";
import { useAnimatedNumber, useBezierAnimation } from "@lukekaalim/act-curve/bezier";

export const ClickDemo/*: Component<>*/ = () => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();

  const renderer = useWebGLRenderer(canvasRef);
  const manager = useRaycastManager();
  useRenderLoop(renderer, cameraRef, sceneRef, () => {
    const { current: camera } = cameraRef;
    if (!camera)
      return;
    
    manager.onUpdate(camera);
  });
  const canvasSize = useResizingRenderer(canvasRef, renderer);

  useEffect(() => {
    const { current: canvas } = canvasRef;
    if (!canvas)
      return;
    canvas.addEventListener('click', manager.onClick);
    canvas.addEventListener('mousemove', manager.onMouseMove);
    canvas.addEventListener('mouseenter', manager.onMouseEnter);
    canvas.addEventListener('mouseleave', manager.onMouseExit);
    return () => {
      canvas.removeEventListener('click', manager.onClick);
      canvas.removeEventListener('mousemove', manager.onMouseMove);
      canvas.removeEventListener('mouseenter', manager.onMouseEnter);
      canvas.removeEventListener('mouseleave', manager.onMouseExit);
    }
  }, []);
  useEffect(() => {
    manager.onMouseMove
  }, [])

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
    h('canvas', { ref: canvasRef, class: styles.demoCanvas, tabIndex: 0 }),
    h(raycastManagerContext.Provider, { value: manager }, [
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
  const [selected, setSelected] = useState(false);

  const spinColor = () => {
    materialRef.current.color = new Color(`hsl(${Math.random() * 255}, 75%, 75%)`)
  }

  useRaycast(ref, {
    click: () => (spinColor(), setSelected(s => !s)),
  });
  useAnimation(() => {
    if (selected && ref.current)
      ref.current.rotateZ(0.01 * Math.PI);
  }, [selected]);

  const materialRef = useRef(new MeshBasicMaterial({ color: 'yellow' }))

  const [anim] = useAnimatedNumber(selected ? 1 : 0, 0);
  useBezierAnimation(anim, (v) => {
    const { current: mesh } = ref;
    if (!mesh)
      return;
  
    mesh.position.set(position.x, position.y, position.z - v.position)
  })

  return [
    h(mesh, {
      ref,
      position,
      geometry: boxGeometry,
      material: materialRef.current
    })
  ];
};