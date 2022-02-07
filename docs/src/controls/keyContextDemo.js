// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useRef, useState, useEffect } from '@lukekaalim/act';
import { useTimeSpan } from "@lukekaalim/act-curve";
import { scene, perspectiveCamera, useRenderLoop, useWebGLRenderer } from "@lukekaalim/act-three";

import { GridHelperGroup, BoxHelperGroup } from "./helpers.js";
import styles from './index.module.css';
import { calculateBezier2DPoint, useAnimatedVector2 } from "../pages/layouts";
import { Vector3 } from "three";
import { useResizingRenderer } from "@lukekaalim/act-three/hooks";
import {
  keyboardContext,
  useKeyboardContextValue,
  useKeyboardEvents,
} from "./keyboard";
import { useFocus } from "./focus";

const controls = {
  up: ([x, y]) => [x, y + 10],
  left: ([x, y]) => [x - 10, y],
  down: ([x, y]) => [x, y - 10],
  right: ([x, y]) => [x + 10, y],
}
const keyControls = {
  'KeyW': controls.up,
  'KeyA': controls.left,
  'KeyS': controls.down,
  'KeyD': controls.right,
  'ArrowLeft': controls.left,
  'ArrowUp': controls.up,
  'ArrowDown': controls.down,
  'ArrowRight': controls.right,
}

export const KeyContextDemo/*: Component<>*/ = () => {
  const canvasRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const isFocused = useFocus(canvasRef);

  const contextValue = useKeyboardContextValue(canvasRef);
  
  const renderer = useWebGLRenderer(canvasRef);
  useResizingRenderer(canvasRef, renderer);
  useRenderLoop(renderer, (cameraRef/*: any*/), sceneRef);
  
  const canvasSize = useResizingRenderer(canvasRef, renderer);
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
    h('samp', { style: { textAlign: 'center' } },
      h('pre', {}, JSON.stringify({
        isFocused,
      }))),
    h(scene, { ref: sceneRef }, [
      h(GridHelperGroup),
      h(keyboardContext.Provider, { value: contextValue }, [
        h(ChildCube),
        h(Camera, { ref: cameraRef }),
      ])
    ])
  ];
};

const Camera = ({ ref }) => {
  const [position, setPosition] = useState([0, 0]);
  useKeyboardEvents({ down: (event) => {
    const control = keyControls[event.code];
    if (!event.shiftKey && control && !event.repeat) {
      event.preventDefault();
      setPosition(control);
    }
  } }, [])

  const focusAnim = useAnimatedVector2(position, [0, 0], 30, 600);
  useTimeSpan(focusAnim.max, now => {
    const { current: camera } = ref;
    if (!camera)
      return;
    const { position: focus } = calculateBezier2DPoint(focusAnim, now);
    camera.position.set(-focus[0], 40, focus[1] - 40);
    camera.lookAt(new Vector3(-focus[0], 0, focus[1]));
  }, [focusAnim]);

  return [
    h(perspectiveCamera, { ref }),
  ]
};

const ChildCube = () => {
  const ref = useRef();
  const [position, setPosition] = useState([0, 0]);

  useKeyboardEvents({ down: (event) => {
    const control = keyControls[event.code];
    if (event.shiftKey && control && !event.repeat) {
      event.preventDefault();
      setPosition(control);
    }
  } }, [])

  const cubeAnim = useAnimatedVector2(position, [0, 0], 30, 600);
  useTimeSpan(cubeAnim.max, now => {
    const { current: box } = ref;
    if (!box)
      return;
    const { position } = calculateBezier2DPoint(cubeAnim, now);
    box.position.set(-position[0], 0, position[1]);
  }, [cubeAnim]);

  return [
    h(BoxHelperGroup, {
      ref,
      size: [10, 10, 10],
    })
  ]
}