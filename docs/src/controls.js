// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */
import { h, useEffect } from '@lukekaalim/act';
import { scene } from '@lukekaalim/act-three';
import { GridHelper, Vector3 } from "three";

import { Document, Markdown } from "@lukekaalim/act-rehersal";
import { perspectiveCamera } from "@lukekaalim/act-three";
import { useRef, useState } from "@lukekaalim/act";
import { calculateBezier2DPoint, useAnimatedVector2 } from "./pages/layouts";
import { maxSpan, useTimeSpan } from "@lukekaalim/act-curve";
import {
  calculateCubicBezierAnimationPoint,
  useAnimatedNumber,
} from "@lukekaalim/act-curve/bezier";
import {
  useAnimationFrame,
  useRenderLoop,
  useWebGLRenderer,
} from "@lukekaalim/act-three/hooks";

import controlsText from './controls/index.md?raw';
import styles from './controls/index.module.css';
import { keyboardContext, useKeyboardContextValue, useKeyboardEvents } from './controls/keyboard.js';
import { useAnimation } from "@lukekaalim/act-curve/animation";
import { KeyEventDemo } from "./controls/keyEventDemo.js";
import { KeyContextDemo } from "./controls/keyContextDemo.js";
import { KeyStateDemo } from "./controls/keyStateDemo.js";
import { KeyboardTrackDemo } from "./controls/keyTrackDemo.js";

/*::
type KeyTrack = { time: DOMHighResTimeStamp, keys: string[] }[];
*/

const usePendingInputs = () => {
  const trackRef = useRef([]);
  const keysRef = useRef(new Set());

  const read = () => {
    const final = { time: performance.now(), keys: [...keysRef.current] };
    const track = [...trackRef.current, final];
    trackRef.current = [final];
    return track;
  };
  const down = ({ key, timeStamp }/*: KeyboardEvent*/) => {
    if (keysRef.current.has(key))
      return;
    keysRef.current.add(key);
    trackRef.current.push({ keys: [...keysRef.current], time: timeStamp });
  };
  const up = ({ key, timeStamp }/*: KeyboardEvent*/) => {
    if (!keysRef.current.has(key))
      return;
    keysRef.current.delete(key);
    trackRef.current.push({ keys: [...keysRef.current], time: timeStamp });
  };
  return [read, { up, down }]
};

const keysToAxis = (speed, keys) => {
  const left = keys.includes('a') ? -1 : 0;
  const right = keys.includes('d') ? 1 : 0;
  const forward = keys.includes('w') ? 1 : 0;
  const back = keys.includes('s') ? -1 : 0;

  const y = (forward + back) * speed;
  const x = (left + right) * speed;
  return [x, y];
};

const useKeyboardAxis = (ref) => {
  const [read, { up, down }] = usePendingInputs();
  useKeyboardEvents(ref, { down, up });

  const readMovement = () => {
    const inputs = read();
    const velocityTrack = inputs
      .map(({ time, keys }) => ({
        time,
        velocity: keysToAxis(0.005, keys)
      }));
    const movement = velocityTrack
      .map((frame, index) => {
        const prevFrame = velocityTrack[index - 1] || { velocity: [0, 0], time: 0 };
        const duration = frame.time - prevFrame.time;
        const velocity = prevFrame.velocity;
        return [
          velocity[0] * duration,
          velocity[1] * duration
        ];
      })
      .reduce((acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]], [0, 0])
    return movement;
  };
  
  return readMovement;
};

const GridScene = ({ canvasRef }) => {
  const positionAnim = useAnimatedVector2(focus.position, focus.position, 0, 1);
  const [rotAnim] = useAnimatedNumber(focus.rotation, focus.rotation, { impulse: 0.40, duration: 600 });
  const cameraRef = useRef();
  const sceneRef = useRef();
  const positionRef = useRef([0, 0]);

  useAnimationFrame(now => {
    const { current: camera } = cameraRef;
    if (!camera)
      return;

    const { position: rotation } = calculateCubicBezierAnimationPoint(rotAnim, now);

    const radians = rotation * Math.PI * 2;

    const forward = [Math.cos(radians), Math.sin(radians)];
    const right = [Math.cos(radians + Math.PI/2), Math.sin(radians + Math.PI/2)];

    const movement = readMovement();
    const prevPosition = positionRef.current;
    const position = [
      prevPosition[0] + (Math.round(right[0]) * movement[0]) + (Math.round(forward[0]) * movement[1]),
      prevPosition[1] + (Math.round(right[1]) * movement[0]) + (Math.round(forward[1]) * movement[1]),
    ];
    positionRef.current = position;


    const cameraPosition = [
      (position[0] * 10) + (-40 * Math.cos(radians)),
      80,
      (position[1] * 10) + (-40 * Math.sin(radians)),
    ]
    
    camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
    camera.lookAt(new Vector3(position[0] * 10, 0, position[1] * 10));
  }, [rotAnim]);

  const renderer = useWebGLRenderer(canvasRef);
  useRenderLoop(renderer, cameraRef, sceneRef);


  useEffect(() => {
    const { current: scene } = sceneRef;
    if (!scene)
      return;
    
    const grid = new GridHelper(100, 10);
    scene.add(grid);
  
    return () => {
      scene.remove(grid);
    }
  }, []);


  return h(scene, { ref: sceneRef }, [
    h(perspectiveCamera, { ref: cameraRef }),
  ]);
};

const ControlDemo = ({ node }) => {
  const canvasRef = useRef();

  const [focus, setFocus] = useState({ rotation: 1/8, position: [0.5, 0.5] });
  const turn = (r) => {
    setFocus(f => ({
      ...f,
      rotation: r + f.rotation
    }));
  } 
  const move = () => {

  };
  const onKeyUp = (e) => {
    switch (e.key) {
      case 'q':
        return turn(-1/8);
      case 'e':
        return turn(1/8);
    }
  };

  const readMovement = useKeyboardAxis(canvasRef)

  return [
    h(GridScene, { canvasRef, readMovement, focus }),
    h('canvas', { class: styles.controls, ref: canvasRef, tabIndex: '0', onKeyUp, style: { width: '100%' } }),
    h('samp', {}, h('pre', {}, JSON.stringify({ focus }, null, 2))),
  ];
};

const useKeyPresses = () => {
  const [keysPressed, setKeysPressed] = useState/*:: <Set<string>>*/(new Set());
  const onKeyDown = (e) => {
    setKeysPressed(s => new Set([...s, e.key]));
  };
  const onKeyUp = (e) => {
    setKeysPressed(s => new Set([...s].filter(k => k !== e.key)));
  };
  return [keysPressed, { onKeyDown, onKeyUp }];
};

const KeyboardContextDemo = () => {

};

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'events':
      return h(KeyEventDemo);
    case 'context':
      return h(KeyContextDemo);
    case 'state':
      return h(KeyStateDemo);
    case 'track':
      return h(KeyboardTrackDemo);
    default:
      return null;
  }
}

const directives = {
  demo: Demo,
}

export const controlsPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: controlsText, directives })),
  link: { children: [], name: 'Controls', href: '/controls' }
}

export const controlsPages = [
  controlsPage,
];
