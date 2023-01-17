// @flow strict
/*::
import type { ReadOnlyRef } from "../three/useChildObject";
import type { LoopController } from "../three/useLoopController";
import type { Ref } from "@lukekaalim/act";
import type { Context } from "@lukekaalim/act/context";
import type { IntersectionObject, Object3D } from "three";
*/

import { createContext, useEffect, useState } from "@lukekaalim/act";
import { Raycaster, Vector2 } from "three";
import { v4 } from "uuid";

/*::
export type RaycastManager2State = {
  intersection: ?IntersectionObject,
  mousePosition: ?Vector2,
}

export type RaycastManager2TargetSettings = {
  object: Object3D,

  recursive?: boolean,

  onEnter?: (intersection: ?IntersectionObject) => mixed,
  onExit?: (intersection: ?IntersectionObject) => mixed,
}

export type RaycastManager2 = {
  subscribeTarget: (settings: RaycastManager2TargetSettings) => { unsubscribe: () => void };
  connect: (loop: LoopController, element: HTMLElement) => { disconnect: () => void },
  state: RaycastManager2State,
};
*/

const setDeviceCoords = (event/*: MouseEvent*/, vector/*: Vector2*/) => {
  const element = event.target;
  if (element instanceof HTMLElement) {
    const { left, top, width, height } = element.getBoundingClientRect();
    vector.x = ( (event.clientX - left) / width ) * 2 - 1;
    vector.y = - ( (event.clientY - top) / height ) * 2 + 1;
  }
}

export const createRaycastManager2 = (
  initialState/*: ?RaycastManager2State*/ = null,
)/*: RaycastManager2*/ => {
  const targetsSettings = new Map();
  const raycaster = new Raycaster();
  const state = {
    mousePosition: initialState?.mousePosition || null,
    intersection: initialState?.intersection || null,
  }

  const subscribeTarget = (settings) => {
    targetsSettings.set(settings.object, settings);
    const unsubscribe = () => {
      targetsSettings.delete(settings.object);
    };
    return { unsubscribe };
  };

  const hitTarget = (targetSettings, object, hits) => {
    object.raycast(raycaster, hits);
    if (targetSettings.recursive)
      for (const child of object.children)
        hitTarget(targetSettings, child, hits)
  }

  const onInput = ({ camera }) => {
    if (state.mousePosition) {
      raycaster.setFromCamera(state.mousePosition, camera);
      const hits = [];
      for (const targetSettings of targetsSettings.values())
        hitTarget(targetSettings, targetSettings.object, hits)

      hits.sort((a, b) => a.distance - b.distance);
      const closestHit = hits.find(Boolean);

      const closestHitObject = closestHit?.object;
      const prevHitObject = state.intersection?.object;

      // Always exit the previous object before entering
      // the next one
      if (closestHitObject !== prevHitObject) {
        if (prevHitObject)
          exitObject(prevHitObject, closestHit);

        if (closestHitObject)
          enterObject(closestHitObject, closestHit);
      }
      state.intersection = closestHit;
    } else {
      if (state.intersection) {
        exitObject(state.intersection.object);
        state.intersection = null;
      }
    }
  };
  const findAcceptingTargets = (hitObject, targetObject, targetList = []) => {
    const target = targetsSettings.get(targetObject);
    if (target && (hitObject === targetObject || target.recursive))
      targetList.push(target);
      
    if (targetObject.parent)
      findAcceptingTargets(hitObject, targetObject.parent, targetList);

    return targetList;
  }

  const enterObject = (object, intersection) => {
    const targetList = findAcceptingTargets(object, object);
    for (const target of targetList) 
      if (target.onEnter)
        target.onEnter(intersection)
  }
  const exitObject = (object, intersection = null) => {
    const targetList = findAcceptingTargets(object, object);
    for (const target of targetList) 
      if (target.onExit)
        target.onExit(intersection)
  }

  const connect = (loop, element) => {
    const onPointerEnter = (event/*: PointerEvent*/) => {
      if (event.target !== event.currentTarget)
        return;
  
      state.mousePosition = new Vector2(0, 0);
      setDeviceCoords(event, state.mousePosition)
    };
    const onPointerLeave = (event/*: PointerEvent*/) => {
      if (event.target !== event.currentTarget)
        return;
  
      state.mousePosition = null;
    };
    const onPointerMove = (event/*: PointerEvent*/) => {
      if (event.target !== event.currentTarget || !state.mousePosition)
        return;
  
      setDeviceCoords(event, state.mousePosition);
    };
  
    element.addEventListener('pointerenter', onPointerEnter);
    element.addEventListener('pointerleave', onPointerLeave);
    element.addEventListener('pointermove', onPointerMove);
  
    const cancelOnInput = loop.subscribeInput(onInput);
  
    const disconnect = () => {
      cancelOnInput();
      element.removeEventListener('pointerenter', onPointerEnter);
      element.removeEventListener('pointerleave', onPointerLeave);
      element.removeEventListener('pointermove', onPointerMove);
    }

    return { disconnect };
  };

  return { state, subscribeTarget, connect }
};

export const useRaycastManager2 = (
  loop/*: ?LoopController*/,
  elementRef/*: ReadOnlyRef<?HTMLElement>*/,
  state/*: ?RaycastManager2State*/ = { intersection: null, mousePosition: null },
  deps/*: mixed[]*/ = [],
)/*: RaycastManager2*/ => {
  const [raycast] = useState/*:: <RaycastManager2>*/(() => createRaycastManager2(state));
  useEffect(() => {
    raycast.state.intersection = state?.intersection;
    raycast.state.mousePosition = state?.mousePosition;

    const { current: element } = elementRef;
    if (!element || !loop) 
      return;
    const { disconnect } = raycast.connect(loop, element);
    return disconnect;
  }, deps);

  return raycast;
}

export const raycastManager2Context/*: Context<RaycastManager2>*/ = createContext(createRaycastManager2())