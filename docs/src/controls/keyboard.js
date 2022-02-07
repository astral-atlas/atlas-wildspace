// @flow strict
/*:: import type { Ref, Component, Context } from '@lukekaalim/act'; */
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
type KeyboardState = [
  Ref<Set<string>>,
  {
    up: (event: KeyboardEvent) => void,
    down: (event: KeyboardEvent) => void,
  }
];
*/

export const useKeyboardState = ()/*: KeyboardState*/ => {
  const keysRef = useRef(new Set());
  const down = (e) => {
    keysRef.current.add(e.code);
  };
  const up = (e) => {
    keysRef.current.delete(e.code);
  };
  return [keysRef, { down, up }];
};

export const usePendingInputs = () => {
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