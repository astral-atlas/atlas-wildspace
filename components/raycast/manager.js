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

import type { Subscriber, SubscriptionFunction } from "../subscription";
*/
import { Vector2, Raycaster } from 'three';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { useSubscriptionList } from "../subscription";

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

  pointerDown?: IntersectionObject => mixed,
}
type RaycastMissEvents = {
  click?: Ray => mixed,
  enter?: Ray => mixed,
  exit?: () => mixed,
  over?: Ray => mixed,
}

export type RaycastManager = {
  lastIntersectionRef: Ref<?IntersectionObject>,
  subscribe: (object: Object3D, events: RaycastEvents, isHit?: ?(IntersectionObject => boolean)) => () => void,
  subscribeMiss: (events: RaycastMissEvents) => () => void,

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
    if (event.target === event.currentTarget)
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
  const { current: recursiveFocusTargets } = useRef(new Set());
  const { current: isHitFuncs } = useRef(new Map()); 

  const [subscribeEnter, emitEnter] = useTargetedEmitter();
  const [subscribeExit, emitExit] = useTargetedEmitter();
  const [subscribeOver, emitOver] = useTargetedEmitter();

  const [subscribeMissExit,, emitMissExit] = useSubscriptionList();
  const [subscribeMissEnter,, emitMissEnter] = useSubscriptionList();
  const [subscribeMissOver,, emitMissOver] = useSubscriptionList();
  const [subscribeMissClick,, emitMissClick] = useSubscriptionList();

  const lastIntersectionRef = useRef();
  const lastRayRef = useRef()

  const onUpdate = (camera) => {
    if (!mouseEnteredRef.current) {
      const prevFocused = lastIntersectionRef.current && lastIntersectionRef.current.object;
      const prevRay = lastRayRef.current;
      if (prevRay) {
        emitMissExit()
        lastRayRef.current = null;
      }
      if (prevFocused) {
        emitExit(prevFocused, null)
        lastIntersectionRef.current = null;
      }
      return;
    }
      
    raycaster.setFromCamera(mousePosition, camera);
    const intersections = raycaster.intersectObjects([...focusTargets], false);
    
    const focusIntersection = intersections.find(intersection => {
      const isHit = isHitFuncs.get(intersection.object);
      if (!isHit)
        return true;
      return isHit(intersection);
    });
    const nextFocused = focusIntersection && focusIntersection.object;
    const prevFocused = lastIntersectionRef.current && lastIntersectionRef.current.object;

    lastIntersectionRef.current = focusIntersection;
    lastRayRef.current = raycaster.ray;

    if (prevFocused !== nextFocused) {
      if (prevFocused)
        emitExit(prevFocused, raycaster.ray)
      
      if (nextFocused && focusIntersection)
        emitEnter(nextFocused, focusIntersection);
    }

    if (prevFocused && !nextFocused)
      emitMissEnter(raycaster.ray);
    if (!prevFocused && nextFocused)
      emitMissExit();

    if (nextFocused && focusIntersection)
      emitOver(nextFocused, focusIntersection);
    else
      emitMissOver(raycaster.ray)
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

  const subscribe = (object, events, isHit = null) => {
    focusTargets.add(object);
    const unsubEnter = subscribeEnter(object, events.enter);
    const unsubExit = subscribeExit(object, events.exit);
    const unsubOver = subscribeOver(object, events.over);
    const unsubClick = subscribeClick(object, events.click);
    isHitFuncs.set(object, isHit);
    return () => {
      focusTargets.delete(object);
      isHitFuncs.delete(object);
      unsubEnter();
      unsubExit();
      unsubOver();
      unsubClick();
    };
  };
  const subscribeMiss = (events) => {
    const unsubscribeMissEnter = events.enter && subscribeMissEnter(events.enter);
    const unsubscribeMissClick = events.click && subscribeMissClick(events.click);
    const unsubscribeMissOver = events.over && subscribeMissOver(events.over);
    const unsubscribeMissExit = events.exit && subscribeMissExit(events.exit);

    return () => {
      unsubscribeMissEnter && unsubscribeMissEnter();
      unsubscribeMissClick && unsubscribeMissClick();
      unsubscribeMissOver && unsubscribeMissOver();
      unsubscribeMissExit && unsubscribeMissExit();
    }
  }
  
  const manager = useMemo(() => ({
    onClick,
    lastIntersectionRef,
    onMouseMove,
    onMouseEnter,
    onMouseLeave,
    onUpdate,
    subscribe,
    subscribeMiss,
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
  deps/*: mixed[]*/ = [],
  isHit/*: ?(IntersectionObject => boolean)*/ = null
) => {
  useEffect(() => {
    if (!manager)
      return;
    const { current: object } = objectRef;
    if (!object)
      return;

    const unsubscribe = manager.subscribe(object, events, isHit);
    return () => {
      unsubscribe();
    }
  }, [manager, ...deps]);
}