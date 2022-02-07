// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */

import { h, useRef, useState, useEffect } from "@lukekaalim/act";
import styles from './index.module.css';
import { useKeyboardState } from "./keyboard.js";
import { useFocus } from "./focus.js";
import { ControlCanvas } from "./canvas.js";
import { getVectorForKeys } from "./axis";
import { Vector3 } from "three";

export const KeyStateDemo/*: Component<>*/ = () => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();

  const isFocused = useFocus(canvasRef);

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

  const positionRef = useRef([0, 0])
  useEffect(() => {
    const { current: camera } = cameraRef;
    if (!camera)
      return;
    
    let lastInterval = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const delta = now - lastInterval;
      lastInterval = now;

      const vector = getVectorForKeys([...keysRef.current]);
      const focus = [
        (delta * vector[0] * 0.08) + positionRef.current[0],
        (delta * vector[1] * 0.08) + positionRef.current[1]
      ];
      positionRef.current = focus;

      camera.position.set(-focus[0], 40, focus[1] - 40);
      camera.lookAt(new Vector3(-focus[0], 0, focus[1]));
    }, 20);

    return () => {
      clearInterval(id);
    };
  }, [])

  return [
    h('canvas', { ref: canvasRef, class: styles.demoCanvas, onKeyUp, onKeyDown, tabIndex: 0 }),
    h('samp', { style: { textAlign: 'center' } },
      h('pre', {}, JSON.stringify({
        isFocused,
        keys: [...keys],
        position: positionRef.current.map(v => v.toFixed(2))
      }))),
    h(ControlCanvas, { sceneRef, cameraRef, canvasRef }),
  ]
};
