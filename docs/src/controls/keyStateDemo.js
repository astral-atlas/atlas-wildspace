// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */

import { h, useRef, useState, useEffect, useContext } from "@lukekaalim/act";
import styles from './index.module.css';
import { useKeyboardState } from "./keyboard.js";
import { useFocus } from "./focus.js";
import { ControlCanvas } from "./canvas.js";
import { getVectorForKeys } from "./axis";
import { Vector3 } from "three";
import { simulateParticle2D } from "./momentum";
import { intervalContext } from "./context";

export const KeyStateDemo/*: Component<>*/ = () => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();
  const positionSampleRef = useRef/*:: <?HTMLElement>*/();

  const isFocused = useFocus(canvasRef);

  const [keysRef, events] = useKeyboardState();
  const [keys, setKeys] = useState([]);
  const onKeyDown = (event) => {
    events.down(event);
    setKeys([...keysRef.current]);
  };
  const onKeyUp = (event) => {
    events.up(event)
    setKeys([...keysRef.current]);
  }

  const [interval] = useContext(intervalContext)
  const momentumRef = useRef({ position: [0, 0], velocityPerMs: [0, 0] });
  useEffect(() => {
    const { current: camera } = cameraRef;
    const { current: positionSample } = positionSampleRef;
    if (!camera || !positionSample)
      return;
    
    let lastInterval = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const delta = now - lastInterval;
      lastInterval = now;

      const acceleration = getVectorForKeys([...keysRef.current], 0.0003);
      momentumRef.current = simulateParticle2D(
        momentumRef.current,
        { velocityMagnitudeMax: 0.1 },
        acceleration,
        delta
      );
      const focus = momentumRef.current.position;
      const velocity = momentumRef.current.velocityPerMs;

      camera.position.set(-focus[0], 40, focus[1] - 40);
      camera.lookAt(new Vector3(-focus[0], 0, focus[1]));

      positionSample.textContent = JSON.stringify({
        focus: focus.map(f => f.toFixed(2)),
        velocity: velocity.map(f => f.toFixed(2)),
      });
    }, interval);

    return () => {
      clearInterval(id);
    };
  }, [interval])

  return [
    h('canvas', { ref: canvasRef, class: styles.demoCanvas, onKeyUp, onKeyDown, tabIndex: 0 }),
    h('samp', { style: { textAlign: 'center' } },
      h('pre', {}, JSON.stringify({
        isFocused,
        keys: [...keys],
      }))),
    h('samp', { style: { textAlign: 'center' } }, h('pre', { ref: positionSampleRef })),
    h(ControlCanvas, { sceneRef, cameraRef, canvasRef }),
  ]
};
