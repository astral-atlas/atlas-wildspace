// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
import { h, useRef, useState, useEffect } from "@lukekaalim/act";
import { useKeyboardState } from "./keyboard.js";

import styles from './index.module.css';
import { ControlCanvas } from "./canvas.js";
import { useKeyboardTrack } from "./keyboard";
import { getVectorForKeys } from "./axis";
import { Vector3 } from "three";
import { useFocus } from "./focus.js";
import { useContext } from "@lukekaalim/act/hooks";
import { intervalContext } from "./context";
import { simulateParticle2D } from "./momentum";

export const KeyboardTrackDemo/*: Component<>*/ = () => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();

  const isFocused = useFocus(canvasRef);

  const [read, onKeyChange] = useKeyboardTrack()
  const [keysRef, events] = useKeyboardState(null, onKeyChange);
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
    if (!camera)
      return;

    let prevFrame = { time: 0, value: new Set() };
    const id = setInterval(() => {
      const tracks = read()
      const time = performance.now();
      const finalFrame = { ...(tracks[tracks.length - 1] || prevFrame), time };
    
      for (const frame of [...tracks, finalFrame]) {
        const delta = frame.time - prevFrame.time;
        const acceleration = getVectorForKeys([...prevFrame.value]);
        momentumRef.current = simulateParticle2D(
          momentumRef.current,
          { velocityMagnitudeMax: 0.1 },
          [acceleration[0] * 0.0003, acceleration[1] * 0.0003],
          delta
        );
        prevFrame = frame;
      }

      camera.position.set(
        -momentumRef.current.position[0],
        40,
        momentumRef.current.position[1] - 40
      )
      camera.lookAt(new Vector3(
        -momentumRef.current.position[0],
        0,
        momentumRef.current.position[1],
      ))
    }, interval);
    return () => {
      clearInterval(id);
    }
  }, [interval])

  return [
    h('canvas', { ref: canvasRef, class: styles.demoCanvas, onKeyUp, onKeyDown, tabIndex: 0 }),
    h('samp', { style: { textAlign: 'center' } },
      h('pre', {}, JSON.stringify({
        keys: [...keys],
        isFocused,
      }))),
    h(ControlCanvas, { sceneRef, cameraRef, canvasRef }),
  ]
};