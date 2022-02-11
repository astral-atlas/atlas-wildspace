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

import type { SubscriptionFunction } from "./subscription";
*/
import { createContext, useContext, useEffect, useMemo, useRef } from '@lukekaalim/act';
import { Raycaster, Vector2 } from "three";

/*::
export type OnClickRaySubscriber = (
  event: MouseEvent,
  intersection: IntersectionObject,
  intersections: IntersectionObject[]
) => mixed;
*/

/*::
export type ClickRayContextValue = {
  subscribe: (object: Object3D, subscriber: OnClickRaySubscriber) => () => void,
}
*/
export const clickRayContext/*: Context<ClickRayContextValue>*/ = createContext({
  subscribe: () => { throw new Error(); }
})

export const useClickRayContextValue = /*:: <TCamera: Camera>*/(
  cameraRef/*: Ref<?TCamera>*/,
)/*: [ClickRayContextValue, (event: MouseEvent) => mixed]*/ => {
  const subscribersRef = useRef(new Map());
  const raycaster = useMemo(() => new Raycaster(), []);

  const subscribe = (object, subscriber) => {
    const { current: subscribers } = subscribersRef;
    subscribers.set(object, subscriber);
    return () => {
      subscribers.delete(object);
    }
  };

  const onClick = (event) => {
    const boundingRef = ((event.target/*: any*/)/*: HTMLElement*/).getBoundingClientRect();
    const x = ( (event.clientX - boundingRef.left) / boundingRef.width ) * 2 - 1;
    const y = - ( (event.clientY - boundingRef.top) / boundingRef.height ) * 2 + 1;
    const pointer = new Vector2(x, y);
    const { current: camera } = cameraRef;
    if (!camera)
      return;

    const { current: subscribers } = subscribersRef;
    const objects = [...subscribers.keys()];

    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects(objects, false);

    for (const intersection of intersections) {
      const subscriber = subscribers.get(intersection.object);
      if (subscriber)
        subscriber(event, intersection, intersections)
    }
  }

  return [{ subscribe }, onClick];
}

export const useClickRay = /*:: <TObject3D: Object3D>*/(
  ref/*: Ref<?TObject3D>*/,
  onClick/*: OnClickRaySubscriber*/,
  deps/*: mixed[]*/ = []
) => {
  const { subscribe } = useContext(clickRayContext);

  useEffect(() => {
    const { current: object } = ref;
    if (!object)
      return;
    
    const unsubscribe = subscribe(object, onClick);
    return () => {
      unsubscribe();
    }
  }, deps);
}