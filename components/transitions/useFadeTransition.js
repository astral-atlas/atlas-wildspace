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
} from "@lukekaalim/act-curve";
import { v4 as uuid } from 'uuid';
import { calculateCubicBezierAnimationPoint, maxSpan, useTimeSpan } from "@lukekaalim/act-curve";
import { useRefMap } from "../editor/list";

const getKey = (entry) => {
  return entry.id;
}
const getExit = (state) => {
  return state.anim.span.start + state.anim.span.durationMs;
}

/*::
type TransitionState<T> = {
  key: string,
  value: T,
  anim: CubicBezierAnimation
};
*/

export const useFadeTransition = /*:: <T>*/(
  value/*: T*/,
  getId/*: T => string*/,
  deps/*: mixed[]*/,
)/*: [(id: string) => (ref: null | HTMLElement) => void, $ReadOnlyArray<TransitionState<T>>]*/ => {
  const list = [value];
  const getExit = a => a.anim.span.start +  a.anim.span.durationMs;
  const transitionReducer = {
    update(prev, value) {
      return {
        ...prev,
        value,
      };
    },
    enter(value, index, now) {
      const inital = createInitialCubicBezierAnimation(0);
      return {
        key: uuid(),
        value,
        anim: interpolateCubicBezierAnimation(inital, 1, 400, 0, now)
      };
    },
    move(prev) {
      return prev;
    },
    exit(prev, now) {
      return {
        ...prev,
        anim: interpolateCubicBezierAnimation(prev.anim, 0, 400, 0, now)
      }
    }
  }
  const initial = new Map([
    [getId(value), { key: uuid(), value, anim: createInitialCubicBezierAnimation(1) }
  ]])
  const options = {
    initial,
  }

  const anims = useAnimatedKeyedList(list, getId, getExit, transitionReducer, deps, options);

  const [createRef, refMap] = useRefMap/*:: <string, HTMLElement>*/()
  useTimeSpan(maxSpan(anims.map(a => a.anim.span)), (now) => {
    anims.map(({ anim, key }) => {
      const element = refMap.get(key)
      if (!element)
        return;
      const point = calculateCubicBezierAnimationPoint(anim, now);
      element.style.opacity = `${point.position}`;
    })
  }, [anims]);
  
  return [createRef, anims];
}