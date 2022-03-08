// @flow strict
/*::
import type { Context, Ref } from '@lukekaalim/act';
import type {
  Ray,
  IntersectionObject,
  Camera,
  PerspectiveCamera,
  OrthographicCamera,
  Object3D,
} from "three";

import type { Subscriber, SubscriptionFunction } from "./subscription";
*/
import { Vector2, Raycaster } from 'three';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";

/*::
export type OnClickRaySubscriber = (
  event: MouseEvent,
  intersection: IntersectionObject,
  intersections: IntersectionObject[]
) => mixed;

type RaycastEvents = {
  click?: IntersectionObject => mixed,
  enter?: IntersectionObject => mixed,
  exit?: () => mixed,
  over?: IntersectionObject => mixed,
}

export type RaycastManager = {
  lastIntersectionRef: Ref<?IntersectionObject>,
  subscribe: (object: Object3D, events: RaycastEvents) => () => void,
  onUpdate: (camera: Camera) => void,
  onMouseEnter: (event: MouseEvent) => void,
  onMouseLeave: (event: MouseEvent) => void,
  onMouseMove: (event: MouseEvent) => void,
  onClick: (event: MouseEvent) => void,
};
*/

const setDeviceCoords = (event/*: MouseEvent*/, vector/*: Vector2*/) => {
  const element/*: HTMLElement*/ = (event.target/*: any*/);
  const { left, top, width, height } = element.getBoundingClientRect();
  vector.x = ( (event.clientX - left) / width ) * 2 - 1;
  vector.y = - ( (event.clientY - top) / height ) * 2 + 1;
}

const useTargetedEmitter = /*:: <TKey, TEvent>*/()/*: [(TKey, ?(TEvent => mixed)) => () => void, (TKey, TEvent) => void]*/ => {
  const { current: subscribers } = useRef/*:: <Map<TKey, TEvent => mixed>>*/(new Map());
  
  const subscribe = (key, subscriber) => {
    if (subscribers.has(key))
      throw new Error(`Duplicate key subscription!`);
    if (!subscriber)
      return () => {};
  
    subscribers.set(key, subscriber);
    return () => {
      subscribers.delete(key);
    }
  };

  const emit = (key, event) => {
    const subscriber = subscribers.get(key)
    if (subscriber)
      subscriber(event);
  }

  return [subscribe, emit]
};

export const useRaycastManager = ()/*: RaycastManager*/ => {

  const mouseEnteredRef = useRef(false);
  const { current: mousePosition } = useRef(new Vector2(0, 0));
  const onMouseMove = (event) => {
    setDeviceCoords(event, mousePosition);
  }
  const onMouseEnter = () => {
    mouseEnteredRef.current = true;
  };
  const onMouseLeave = () => {
    mouseEnteredRef.current = false;
  }

  const { current: raycaster } = useRef(new Raycaster());
  const { current: focusTargets } = useRef(new Set());

  const [subscribeEnter, emitEnter] = useTargetedEmitter();
  const [subscribeExit, emitExit] = useTargetedEmitter();
  const [subscribeOver, emitOver] = useTargetedEmitter();

  const lastIntersectionRef = useRef();

  const onUpdate = (camera) => {
    if (!mouseEnteredRef.current) {
      const prevFocused = lastIntersectionRef.current && lastIntersectionRef.current.object;
      emitExit(prevFocused, null)
      lastIntersectionRef.current = null;
      console.log('exit');
      return;
    }
      
    raycaster.setFromCamera(mousePosition, camera);
    const intersections = raycaster.intersectObjects([...focusTargets], false);
    
    const focusIntersection = intersections[0];
    const nextFocused = focusIntersection && focusIntersection.object;
    const prevFocused = lastIntersectionRef.current && lastIntersectionRef.current.object;

    lastIntersectionRef.current = focusIntersection;

    if (prevFocused !== nextFocused) {
      if (prevFocused)
        emitExit(prevFocused, null)
      
      if (nextFocused)
        emitEnter(nextFocused, focusIntersection);
    }
    if (nextFocused)
      emitOver(nextFocused, focusIntersection);
  }

  const [subscribeClick, emitClick] = useTargetedEmitter();
  const onClick = (event) => {
    if (!mouseEnteredRef.current)
      return;
    
    const intersection = lastIntersectionRef.current;
    const focused = intersection && intersection.object;
    if (focused && intersection)
      emitClick(focused, intersection);
  }

  const subscribe = (object, events) => {
    focusTargets.add(object);
    const unsubEnter = subscribeEnter(object, events.enter);
    const unsubExit = subscribeExit(object, events.exit);
    const unsubOver = subscribeOver(object, events.over);
    const unsubClick = subscribeClick(object, events.click);
    return () => {
      focusTargets.delete(object);
      unsubEnter();
      unsubExit();
      unsubOver();
      unsubClick();
    };
  };
  
  const manager = useMemo(() => ({
    onClick,
    lastIntersectionRef,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
    onUpdate,
    subscribe
  }));

  return manager;
}

export const raycastManagerContext/*: Context<?RaycastManager>*/ = createContext(null);

export const useRaycast = /*:: <T: Object>*/(objectRef/*: Ref<T>*/, events/*: RaycastEvents*/, deps/*: mixed[]*/ = []) => {
  const manager = useContext(raycastManagerContext);
  
  useEffect(() => {
    if (!manager)
      return;
    const { current: object } = objectRef;
    if (!object)
      return;

    const unsubscribe = manager.subscribe(object, events);
    return () => {
      unsubscribe();
    }
  }, [manager, ...deps]);
};

export const useRaycast2 = /*:: <T: Object>*/(
  manager/*: ?RaycastManager*/,
  objectRef/*: Ref<T>*/,
  events/*: RaycastEvents*/,
  deps/*: mixed[]*/ = []
) => {
  useEffect(() => {
    if (!manager)
      return;
    const { current: object } = objectRef;
    if (!object)
      return;

    const unsubscribe = manager.subscribe(object, events);
    return () => {
      unsubscribe();
    }
  }, [manager, ...deps]);
}