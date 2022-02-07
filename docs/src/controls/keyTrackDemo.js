// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useRef, useState } from "@lukekaalim/act";
import { useKeyboardState } from "./keyboard.js";

import styles from './index.module.css';
import { ControlCanvas } from "./canvas.js";

export const KeyboardTrackDemo/*: Component<>*/ = () => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();

  const [keysRef, events] = useKeyboardState();
  const [keys, setKeys] = useState([]);
  const onKeyDown = (event) => {
    event.preventDefault()
    if (event.repeat)
      return
    events.down(event);
    setKeys([...keysRef.current]);
  };
  const onKeyUp = (event) => {
    event.preventDefault()
    if (event.repeat)
      return
    events.up(event)
    setKeys([...keysRef.current]);
  }

  return [
    h('canvas', { ref: canvasRef, class: styles.demoCanvas, onKeyUp, onKeyDown, tabIndex: 0 }),
    h('samp', { style: { textAlign: 'center' } },
      h('pre', {}, JSON.stringify({
        keys: [...keys],
      }))),
    h(ControlCanvas, { sceneRef, cameraRef, canvasRef }),
  ]
};