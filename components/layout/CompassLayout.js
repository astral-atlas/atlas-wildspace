// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
import type { KeyboardTrack, KeyboardTrackEmitter } from "../keyboard";
*/
import { h, useEffect, useRef, useState } from '@lukekaalim/act';
import { isKeyboardStateEqual, useElementKeyboard, useKeyboardTrack, useKeyboardTrackChanges } from '../keyboard';
import { Vector2 } from "three";
import { useKeyboardTrackEmitter, useKeyboardTrackEmitterChanges } from "../keyboard/track";

import styles from './CompassLayout.module.css';
import {
  calculateBezier2DPoint,
  useAnimatedVector2,
  useBezier2DAnimation,
} from "../animation";
import { useBezierAnimation } from "@lukekaalim/act-curve/bezier";
import { useRefMap } from "../editor/list";

const directionalKeys = [
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
];
const focusKeys = [
  'ShiftLeft', 'ShiftRight'
]

const calculateKeyboardDirection = (keys) => {
  const left =  keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0;
  const right = keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0;
  const up =    keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0;
  const down =  keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0;

  const x = right - left;
  const y = up - down;

  return new Vector2(x, y);
}
const getNextDirection = (screens, prev, next, prevDirection) => {
  if (!focusKeys.find(k => next.value.has(k)))
    return prevDirection;

  const nextDirection = calculateKeyboardDirection(next.value)

  if (nextDirection.x === 0 && nextDirection.y == 0 && focusKeys.find(k => prev.value.has(k)))
    return prevDirection;

  if (!screens.find(s => s.position.equals(nextDirection)))
    return prevDirection;
    
  if (prevDirection.x === nextDirection.x &&
      prevDirection.y === nextDirection.y)
    return prevDirection;
  return nextDirection;
}

export const useCompassKeysDirection = (
  emitter/*: KeyboardTrackEmitter*/,
  screens/*: CompassLayoutScreen[]*/,
  onDirectionChange/*:  Vector2 => mixed*/ = () => {},
  initialDirection/*: Vector2*/ = new Vector2(0, 0),
)/*: [Vector2, Vector2 => void, KeyboardTrackEmitter]*/ => {
  const [direction, setDirection] = useState/*:: <Vector2>*/(initialDirection)

  useKeyboardTrackEmitterChanges(emitter, (prev, next) => {

    setDirection(prevDirection => {
      const nextDirection = getNextDirection(screens, prev, next, prevDirection);
      onDirectionChange(nextDirection)
      return nextDirection;
    })
  })
  const childEmitter = {
    subscribe: (listener) => {
      const processFrame = (frame) => {
        if (!focusKeys.find(k => frame.value.has(k)))
          return frame;
        const keyBlacklist = [...directionalKeys, ...focusKeys];
        const filteredValue = new Set(
          [...frame.value]
            .filter(key => !keyBlacklist.includes(key))
        )
        return { ...frame, value: filteredValue };
      }
      const middleListener = (prev, next) => {
        const processedNext = processFrame(next);
        const processedPrev = processFrame(prev);
        if (!isKeyboardStateEqual(processedPrev.value, processedNext.value))
          listener(processedPrev, processedNext);
      }
      const unsubscribe = emitter.subscribe(middleListener)
      return () => {
        unsubscribe();
      };
    }
  }

  return [direction, setDirection, childEmitter];
}

/*::
export type CompassLayoutScreen = {
  position: Vector2,
  content: ElementNode,
  icon: ElementNode,
};

export type CompassLayoutProps = {
  direction: Vector2,
  screens: CompassLayoutScreen[],
}
*/

export const CompassLayout/*: Component<CompassLayoutProps>*/ = ({ direction, screens }) => {
  const translatorRef = useRef();
  const animation = useAnimatedVector2([direction.x, direction.y], [direction.x, direction.y], 3, 1000);
  const smoothAnim = useAnimatedVector2([direction.x, direction.y], [direction.x, direction.y], 0, 1000);

  useEffect(() => {
    for (const [screenIndex, screenRef] of refMap) {
      const screen = screens[screenIndex];
      if (direction.x === screen.position.x && direction.y === screen.position.y) {
        screenRef.style.display = 'initial';
      }
    }
  }, [direction])

  useBezier2DAnimation(animation, (point) => {
    const { current: translator } = translatorRef;
    if (!translator)
      return;

    const smoothPoint = calculateBezier2DPoint(smoothAnim, performance.now());
    const smoothVelocity = (Math.abs(smoothPoint.velocity[0]) + Math.abs(smoothPoint.velocity[1])) / 2;
    const spikyVelocity = (Math.pow(1.1, smoothVelocity))
    
    const scale = 1/spikyVelocity;
    const x = point.position[0] * scale;
    const y = point.position[1] * scale;

    translator.style.transform = `translate(${x * -100}%, ${y * 100}%) scale(${scale})`;

    if (point.progress[0] === 1 && point.progress[1] === 1) {
      for (const [screenIndex, screenRef] of refMap) {
        const screen = screens[screenIndex];
        if (direction.x !== screen.position.x || direction.y !== screen.position.y) {
          screenRef.style.display = 'none';
        }
      }
    }
  })
  const [setRef, refMap] = useRefMap()

  return [
    h('div', {
      tabIndex: 0,
      classList: [styles.compassLayout],
    }, [
      h('div', {
        classList: [styles.compassLayoutTranslator],
        ref: translatorRef, 
      }, [
        screens.map((screen, index) => {
          return h('div', {
            classList: [styles.compassLayoutScreen],
            ref: setRef(index),
            style: {
              transform: `translate(${screen.position.x * 100}%, ${screen.position.y * -100}%)`,
            }
          }, screen.content)
        })
      ]),
    ])
  ];
};

/*::
export type CompassLayoutMinimapProps = {
  screens: CompassLayoutScreen[],
  direction: Vector2,
  onScreenClick?: CompassLayoutScreen => mixed
};
*/

export const CompassLayoutMinimap/*: Component<CompassLayoutMinimapProps>*/ = ({
  screens,
  direction,
  onScreenClick = _ => {},
}) => {
  const cursorRef = useRef()
  const animation = useAnimatedVector2([direction.x, direction.y], [0, 0], 3, 1000)

  useBezier2DAnimation(animation, (point) => {
    const { current: cursor } = cursorRef;
    if (!cursor)
      return;
    cursor.style.transform = `translate(${(padding) + (point.position[0] * size) - left}px, ${(padding) + (-point.position[1] * size) - bottom}px)`;
  })

  const size = 32;

  const left =    Math.min(...screens.map(s => s.position.x)) * size;
  const right =   Math.max(...screens.map(s => s.position.x)) * size;
  const top =     Math.max(...screens.map(s => s.position.y)) * size;
  const bottom =  Math.min(...screens.map(s => s.position.y)) * size;

  const padding = 8;
  const width = -left + right + size + (padding * 2);
  const height = top + -bottom + size + (padding * 2);

  return [
    h('div', { style: { width: `${width}px`, height: `${height}px`, position: 'relative' }}, [
      screens.map(screen => h('button', {
        onClick: () => onScreenClick(screen),
        style: {
          position: 'absolute',
          height: `${size}px`,
          width: `${size}px`,
          left: `${padding + (screen.position.x * size) - left}px`,
          top: `${padding + (-screen.position.y * size) - bottom}px`,
          //backgroundColor: 'black',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box'
        }
      }, screen.icon)),
      h('div', {
        ref: cursorRef,
        style: {
          position: 'absolute',
          height: `${size}px`,
          width: `${size}px`,
          border: '2px solid black',
          boxSizing: 'border-box',
        }
      }),
    ])
  ]
};