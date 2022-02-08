// @flow strict
/*:: import type { Component, Ref } from "@lukekaalim/act"; */
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */
/*:: import type { PerspectiveCamera, Camera } from "three"; */
import { h } from '@lukekaalim/act';
import { scene } from '@lukekaalim/act-three';
import { Vector3 } from 'three';

import { perspectiveCamera } from "@lukekaalim/act-three";
import { useRef, useState } from "@lukekaalim/act";
import { calculateBezier2DPoint, useAnimatedVector2 } from "../pages/layouts";
import { useTimeSpan } from "@lukekaalim/act-curve";
import {
  useRenderLoop,
  useWebGLRenderer,
} from "@lukekaalim/act-three";

import styles from './index.module.css';
import { GridHelperGroup } from "./helpers.js";
import { useFocus } from "./focus.js";
import { useResizingRenderer } from "@lukekaalim/act-three/hooks";
import { useEffect } from "@lukekaalim/act/hooks";

const controls = {
  up: ([x, y]) => [x, y + 10],
  left: ([x, y]) => [x - 10, y],
  down: ([x, y]) => [x, y - 10],
  right: ([x, y]) => [x + 10, y],
}
const keyControls = {
  'w': controls.up,
  'a': controls.left,
  's': controls.down,
  'd': controls.right,
  'ArrowLeft': controls.left,
  'ArrowUp': controls.up,
  'ArrowDown': controls.down,
  'ArrowRight': controls.right,
}

export const KeyEventDemo/*: Component<>*/ = () => {
  const canvasRef = useRef();
  const cameraRef = useRef/*:: <?PerspectiveCamera>*/();
  const sceneRef = useRef();
  const isFocused = useFocus(canvasRef);

  const [focus, setFocus] = useState([0, 0]);
  const onKeyDown = (event) => {
    const control = keyControls[event.key];
    if (control) {
      event.preventDefault();
      if (!event.repeat) {
        setFocus(control || (f => f))
      }
    }
  };

  const anim = useAnimatedVector2(focus, [0, 0], 30, 600);
  const renderer = useWebGLRenderer(canvasRef);

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

  useTimeSpan(anim.max, now => {
    const { current: camera } = cameraRef;
    if (!camera)
      return;
    const { position: focus } = calculateBezier2DPoint(anim, now);
    camera.position.set(-focus[0], 40, focus[1] - 40);
    camera.lookAt(new Vector3(-focus[0], 0, focus[1]));
  }, [anim]);

  return [
    h('canvas', { ref: canvasRef, class: styles.demoCanvas, onKeyDown, tabIndex: 0 }),
    h('samp', { style: { textAlign: 'center' } },
      h('pre', {}, JSON.stringify({ isFocused, focus }))),
    h(scene, { ref: sceneRef }, [
      h(perspectiveCamera, { ref: cameraRef }),
      h(GridHelperGroup)
    ])
  ]
}