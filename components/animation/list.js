// @flow strict


import { useMemo, useRef, useState, useEffect } from "@lukekaalim/act"
import { createCubicBeizerElementReducer } from "@lukekaalim/act-curve";

/*::
import type { CubicBezierAnimation } from "@lukekaalim/act-curve";
import type { SetValue } from "@lukekaalim/act/hooks";

type ListChangeAnimator = {

};
type ListChangesOptions<T, S> = {
  initial?: Map<string, S>,
};

type ListElementAnimation<T> = {
  value: T,

  entered: number,
  exitied: number,
};

export type ListElementChangeReducers<T, S> = {
  enter:  (value: T, nextIndex: number, now: number) => S,
  move:   (prevState: S, value: T, prevIndex: number, nextIndex: number, now: number) => S,
  update: (prevState: S, value: T) => S,
  exit:   (prevState: S, now: number) => S,
};
*/

export const useAnimatedKeyedList = /*:: <T, S>*/(
  list/*: $ReadOnlyArray<T>*/,
  getKey/*: T => string*/,
  getExitTime/*: S => number*/,
  reducers/*: ListElementChangeReducers<T, S>*/,
  deps/*: mixed[]*/ = [],
  { initial = new Map() }/*: ListChangesOptions<T, S>*/ = {}
)/*: $ReadOnlyArray<S>*/ => {
  const [persisting, setPersisting] = useState/*:: <Map<string, S>>*/(() => new Map(initial));
  const [exiting, setExiting] = useState/*:: <Map<string, S>>*/(new Map())

  useEffect(() => {
    const update = (newValues, persisting) => {
      const t = performance.now();
    
      const next = new Map(newValues.map(value => [getKey(value), value]));
      
      const nextKeys = [...next.keys()];
      const prevKeys = [...persisting.keys()];
      
      const changes = calculateIndexChanges(prevKeys, nextKeys);
    
      const persistingAnimations/*: [string, S][]*/ = [...next]
        .map(([key, value], nextIndex) => {
          if (changes.created.includes(nextIndex))
            return [key, reducers.enter(value, nextIndex, t)];
          if (changes.persisted.includes(nextIndex)) {
            const prev = persisting.get(key);
            if (!prev)
              throw new Error(`Something catastrohphic`);
            return [key, reducers.update(prev, value)];
          }
          const moveIndices = changes.moved.find(([_, movedNextIndex]) => movedNextIndex === nextIndex)
          if (!moveIndices)
            throw new Error(`Something catastrohphic`);
          const prev = persisting.get(prevKeys[moveIndices[0]]);
          if (!prev)
            throw new Error(`Something catastrohphic`);
          return [key, reducers.move(prev, value, moveIndices[0], moveIndices[1], t)];
        })
      const exitingAnimations = changes.removed.map(removedIndex => {
        const key = prevKeys[removedIndex];
        const prev = persisting.get(key);
        if (!prev)
          throw new Error();
        return [key, reducers.exit(prev, t)];
      })
      return { persistingAnimations, exitingAnimations };
    };

    setPersisting(p => {
      const { persistingAnimations, exitingAnimations } = update(list, p);
      setExiting(e => new Map([...e, ...exitingAnimations]))
      return new Map(persistingAnimations)
    });
  }, deps);

  const earliestExit = [...exiting]
    .reduce((earliestExit, [key, state]) => {
      const exitTime = getExitTime(state);
      
      if (earliestExit == null || exitTime < earliestExit.exitTime)
        return { exitTime, key };
      return earliestExit;
    }, null)
  
  useEffect(() => {
    if (earliestExit === null)
      return;
    const timeUntilEarliestExit = Math.max(earliestExit.exitTime - performance.now(), 0);
    
    const id = setTimeout(() => {
      setExiting(e => {
        const map = new Map(e)
        map.delete(earliestExit.key);
        return map;
      })
    }, timeUntilEarliestExit)
    return () => clearTimeout(id);
  }, [earliestExit && earliestExit.exitTime, earliestExit && earliestExit.key])

  const animations = useMemo(() => {
    return [
      ...list.map(value => {
        const key = getKey(value);
        return persisting.get(key);
      }),
      ...exiting.values(),
    ].filter(Boolean)
  }, [exiting, persisting])

  return animations;
}

/*::
export type IndexChangeset = {
  created: number[],
  persisted: number[],
  moved: [number, number][],
  removed: number[]
}
*/

const calculateIndexChanges = /*:: <A, B>*/(
  prev/*: A[]*/,
  next/*: B[]*/,
)/*: IndexChangeset*/ => {
  const created = [];
  const persisted = [];
  const moved = [];
  const removed = []

  for (let nextIndex = 0; nextIndex < next.length; nextIndex++) {
    const nextElement = next[nextIndex];
  
    const prevIndex = prev.indexOf(nextElement);
    if (prevIndex === -1) {
      // There is no previous index, this element was just created
      created.push(nextIndex);
    } else {
      // there is a prev & next index, this element persisted
      if (prevIndex === nextIndex) {
        persisted.push(nextIndex)
      } else {
        moved.push([prevIndex, nextIndex])
      }
    }
  }
  for (let prevIndex = 0; prevIndex < prev.length; prevIndex++) {
    const prevElement = prev[prevIndex];
    const nextIndex = next.indexOf(prevElement);
    if (nextIndex === -1)  {
      // there is no next index, this element has been removed
      removed.push(prevIndex);
    } else {
      // there is a prev & next index, but this case shoudl already be handled.
    }
  }

  return {
    created,
    persisted,
    removed,
    moved,
  };
}