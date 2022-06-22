// @flow strict
/*::
import type { ElementNode } from "@lukekaalim/act";
import type { CubicBezierAnimation } from "@lukekaalim/act-curve";
import type { ListElementChangeReducers } from "../animation/list";
*/

import { useAnimatedKeyedList } from "../animation/list";
import {
  createInitialCubicBezierAnimation,
  interpolateCubicBezierAnimation,
  sequenceSpanPairs,
} from "@lukekaalim/act-curve";
import { v4 as uuid } from 'uuid';
import { calculateCubicBezierAnimationPoint, maxSpan, useTimeSpan } from "@lukekaalim/act-curve";
import { useRefMap } from "../editor/list";
import { useEffect, useState } from "@lukekaalim/act";

const getKey = (entry) => {
  return entry.id;
}
const getExit = (state) => {
  return state.anim.span.start + state.anim.span.durationMs;
}

/*::
export type TransitionState<T> = {
  key: string,
  value: T,
  anim: CubicBezierAnimation
};
*/


export const useFadeTransition = /*:: <T>*/(
  value/*: ?T*/,
  getId/*: T => string*/,
  deps/*: mixed[]*/,
)/*: $ReadOnlyArray<TransitionState<T>>*/ => {

  const [exiting, setExiting] = useState/*:: <TransitionState<T>[]>*/([]);
  const [persisting, setPersisting] = useState/*:: <?TransitionState<T>>*/(null);

  useEffect(() => {
    const now = performance.now();

    const animateExit = (state) => ({
      ...state,
      anim: interpolateCubicBezierAnimation(state.anim, 0, 1000, 3, now), 
    })
    const animateEntry = (value, hasPrevious) => ({
      key: uuid(),
      value,
      anim: interpolateCubicBezierAnimation(createInitialCubicBezierAnimation(0), 1, 1000, 3, now + (hasPrevious ? 500 : 0)),
    })

    setPersisting(persisting => {
      if (persisting && value && getId(persisting.value) === getId(value)) {
        return {
          ...persisting,
          value,
        }
      } else {
        setExiting(exiting => [
          persisting && animateExit(persisting),
          ...exiting,
        ].filter(Boolean))
  
        return !!value && animateEntry(value, !!persisting) || null;
      }
    });
  }, [value && getId(value), ...deps])

  useEffect(() => {
    const exitTimes = exiting.map(exit => exit.anim.span.start + exit.anim.span.durationMs);
    const [exit, index] = exitTimes.reduce(
      ([accExit, accIndex], exit, index) =>
        exit < accExit ? [exit, index] : [accExit, accIndex],
      [Number.POSITIVE_INFINITY, -1]
    )
    if (index === -1)
      return;
    const exitKey = exiting[index].key;
    const millsecondsUntilExit = exit - performance.now();
    const id = setTimeout(() => {
      setExiting(exiting => exiting.filter(e => e.key !== exitKey));
    }, millsecondsUntilExit)

    return () => {
      clearTimeout(id);
    }
  }, [exiting])

  
  return [persisting, ...exiting].filter(Boolean);
}