// @flow strict

/*:: import type { KeyboardStateEmitter } from "./changes";
import type { KeyboardState } from "./state";
import type { Frame } from "@lukekaalim/act-curve"; */
import { useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { isKeyboardStateEqual } from "./changes";

/*::
export type KeyboardFrame = Frame<KeyboardState>;

export type KeyboardTrack = {
  readAll: () => KeyboardFrame[],
  readDiff: () => { prev: KeyboardFrame, next: KeyboardFrame },
};
*/

export const useKeyboardTrack = (emitter/*: KeyboardStateEmitter*/)/*: KeyboardTrack*/ => {
  const trackRef = useRef/*:: <Frame<KeyboardState>[]>*/([{ time: 0, value: new Set() }]);

  const readAll = () => {
    const trackToRead = [...trackRef.current];
    const prevFrame = trackToRead[trackToRead.length - 1];
    const finalKeys =  (prevFrame && prevFrame.value) || new Set();
    const edgeFrame = { time: performance.now(), value: finalKeys }
    trackRef.current = [edgeFrame];
    return [...trackToRead, edgeFrame];
  };
  const readDiff = () => {
    const latest = trackRef.current[trackRef.current.length - 1];
    const prev = trackRef.current[0];
    const next = { value: latest.value, time: performance.now() };

    trackRef.current = [next];

    return { prev, next }
  };

  const onStateChange = (nextKeys, event) => {
    const frame = {
      value: nextKeys,
      time: event.timeStamp
    };
    trackRef.current.push(frame);
  };
  const keyboardTrack = useMemo(() => ({
    readAll,
    readDiff,
  }), [])

  useEffect(() => {
    const unsubscribe = emitter.subscribe(onStateChange) 
    return () => unsubscribe();
  }, [emitter])

  return keyboardTrack;
};

export const useKeyboardTrackChanges = (
  track/*: ?KeyboardTrack*/,
  listener /*: (prev: KeyboardFrame, next: KeyboardFrame) => mixed*/,
  deps/*: mixed[]*/ = []
) => {
  useEffect(() => {
    if (!track)
      return;
    
    let id = null;
    const update = () => {
      const { prev, next } = track.readDiff();
      if (!isKeyboardStateEqual(prev.value, next.value))
        listener(prev, next);
      id = requestAnimationFrame(update);
    };
    update();

    return () => {
      if (id)
        cancelAnimationFrame(id);
    }

  }, [track, ...deps])
};

/*::
export type KeyboardTrackEmitter = {
  subscribe: (subscriber: (prev: KeyboardFrame, next: KeyboardFrame) => mixed) => (() => void)
}
*/

export const useKeyboardTrackEmitter = (track/*: KeyboardTrack*/)/*: KeyboardTrackEmitter*/ => {
  const [subscribers] = useState(new Set());

  useEffect(() => {
    if (!track)
      return;
    
    let id = null;
    const update = () => {
      const { prev, next } = track.readDiff();
      
      if (!isKeyboardStateEqual(prev.value, next.value))
        for (const subscriber of subscribers)
          subscriber(prev, next);
      
      id = requestAnimationFrame(update);
    };
    update();

    return () => {
      if (id)
        cancelAnimationFrame(id);
    }

  }, [track])

  const subscribe = (subscriber) => {
    subscribers.add(subscriber)
    return () => {
      subscribers.delete(subscriber);
    };
  };

  const emitter = useMemo(() => ({
    subscribe,
  }), []);

  return emitter;
}

export const useKeyboardTrackEmitterChanges = (
  emitter/*: ?KeyboardTrackEmitter*/,
  onKeyChange/*: (prev: KeyboardFrame, next: KeyboardFrame) => mixed*/,
  deps/*: mixed[]*/ = [],
) => {
  useEffect(() => {
    if (!emitter)
      return;
    const unsubscribe = emitter.subscribe(onKeyChange);
    return () => {
      unsubscribe();
    }
  }, [emitter, ...deps])
}