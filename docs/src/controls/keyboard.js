// @flow strict
/*:: import type { Ref, Component, Context } from '@lukekaalim/act'; */
/*:: import type { Frame } from "@lukekaalim/act-curve"; */
/*:: import type { SubscriptionFunction, Subscriber } from './subscription.js'; */

import { h, useContext, useEffect, createContext } from "@lukekaalim/act";
import { useMemo } from "@lukekaalim/act";
import { useSubscriptionList } from './subscription.js';
import { useRef } from "@lukekaalim/act/hooks";

/*::
type KeyboardContextValue = {
  subscribeDown: SubscriptionFunction<KeyboardEvent>,
  subscribeUp: SubscriptionFunction<KeyboardEvent>
}
*/

export const keyboardContext/*: Context<KeyboardContextValue>*/ = createContext({
  subscribeDown: () => { throw new Error(); },
  subscribeUp: () => { throw new Error(); }
});

/*::
export type KeyboardEvents = {
  up?: Subscriber<KeyboardEvent>,
  down?: Subscriber<KeyboardEvent>
};
*/
export const useKeyboardEvents = (
  { up, down }/*: KeyboardEvents*/,
  deps/*: mixed[]*/ = []
) => {
  const { subscribeDown, subscribeUp } = useContext(keyboardContext);

  useEffect(() => {
    const unsubscribeDown = down && subscribeDown(down);
    const unsubscribeUp = up && subscribeUp(up);

    return () => {
      unsubscribeDown && unsubscribeDown();
      unsubscribeUp && unsubscribeUp();
    }
  }, deps);
};

export const useKeyboardContextValue = /*:: <T: HTMLElement>*/(
  ref/*: Ref<?T>*/
)/*: KeyboardContextValue*/ => {
  const [subscribeUp, upSubscribersRef] = useSubscriptionList();
  const [subscribeDown, downSubscribersRef] = useSubscriptionList();
  const value = useMemo(() => ({
    subscribeUp,
    subscribeDown,
  }), []);
  useEffect(() => {
    const { current: element } = ref;
    if (!element)
      return;
    const onDown = (event/*: KeyboardEvent*/) => {
      for (const subscriber of downSubscribersRef.current) {
        subscriber(event);
        if (event.defaultPrevented)
          return;
      }
    };
    const onUp = (event/*: KeyboardEvent*/) => {
      for (const subscriber of upSubscribersRef.current) {
        subscriber(event);
        if (event.defaultPrevented)
          return;
      }
    };
    element.addEventListener('keydown', onDown);
    element.addEventListener('keyup', onUp);
    return () => {
      element.removeEventListener('keydown', onDown);
      element.removeEventListener('keyup', onUp);
    };
  }, [])
  return value;
};

export const rotateVector = (
  rotation/*: number*/,
  position/*: [number, number]*/,
)/*: [number, number]*/ => {
  const radians = rotation * Math.PI * 2;

  const forward = [Math.cos(radians), Math.sin(radians)];
  const right = [Math.cos(radians + Math.PI/2), Math.sin(radians + Math.PI/2)];

  return [
    (right[0] * position[0]) + (forward[0] * position[1]),
    (right[1] * position[0]) + (forward[1] * position[1]),
  ];
};

/*::
type KeyboardStateFunction = (event: KeyboardEvent) => Set<string>;
type KeyboardStateEvents = {
  up: KeyboardStateFunction,
  down: KeyboardStateFunction,
}

type KeyboardState = [
  Ref<Set<string>>,
  KeyboardStateEvents
];
*/

export const useKeyboardState = (
  validKeys/*: ?Set<string>*/ = null,
  onStateChange/*: ?((nextKeys: Set<string>, event: KeyboardEvent) => mixed)*/ = null
)/*: KeyboardState*/ => {
  const keysRef = useRef(new Set());

  const isValidEvent = (event) => {
    if (event.code === 'CapsLock')
      return false;
    if (validKeys && !validKeys.has(event.code))
      return false;
    return true;
  }
  const down = (e) => {
    if (isValidEvent(e)) {
      e.preventDefault();
      if (!e.repeat) {
        keysRef.current.add(e.code);
        if (onStateChange)
          onStateChange(new Set(keysRef.current), e);
      }
    }
    return keysRef.current;
  };
  const up = (e) => {
    if (isValidEvent(e)) {
      e.preventDefault();
      keysRef.current.delete(e.code);
      if (onStateChange)
        onStateChange(new Set(keysRef.current), e);
    }
    return keysRef.current;
  };

  return [keysRef, { down, up }];
};

/*::
type KeyboardFrame = Frame<Set<string>>;

type KeyboardTrackControl = [
  () => KeyboardFrame[],
  (nextKeys: Set<string>, event: KeyboardEvent) => mixed
];
*/

export const useKeyboardTrack = ()/*: KeyboardTrackControl*/ => {
  const trackRef = useRef/*:: <Frame<Set<string>>[]>*/([]);

  const read = () => {
    const trackToRead = [...trackRef.current];
    const prevFrame = trackToRead[trackToRead.length - 1];
    const finalKeys =  (prevFrame && prevFrame.value) || new Set();
    const edgeFrame = { time: performance.now(), value: finalKeys }
    trackRef.current = [edgeFrame];
    return [...trackToRead, edgeFrame];
  };
  const onStateChange = (nextKeys, event) => {
    const frame = {
      value: nextKeys,
      time: event.timeStamp
    };
    trackRef.current.push(frame);
  };

  return [read, onStateChange]
};

// Velocity of +1 is key down
// Velocity of -1 is key up
// velocity of 0 is unchanged (down or up)
export const calculateKeyVelocity = (
  prevKeys/*: Set<string>*/,
  nextKeys/*: Set<string>*/,
)/*: Map<string, number>*/ => {
  const allKeys = new Set([...prevKeys, ...nextKeys]);
  const velocityPairs = [...allKeys]
    .map((key) => {
      const prev = prevKeys.has(key) ? 1 : 0;
      const next = nextKeys.has(key) ? 1 : 0;
      const velocity = next - prev;
      return [key, velocity];
    });
  return new Map(velocityPairs);
};