// @flow strict

/*::
import type { Ref } from "@lukekaalim/act";
import type { RaycastManager } from "./manager";
*/

import { useEffect } from "@lukekaalim/act"

export const useRaycastElement = /*:: <T: HTMLElement>*/(raycast/*: RaycastManager*/, elementRef/*: Ref<?T>*/) => {
  useEffect(() => {
    const { current: element } = elementRef;
    if (!element)
      return;

    element.addEventListener('pointerenter', raycast.onMouseEnter);
    element.addEventListener('pointerleave', raycast.onMouseLeave);
    element.addEventListener('pointermove', raycast.onMouseMove);
    return () => {
      element.removeEventListener('pointerenter', raycast.onMouseEnter);
      element.removeEventListener('pointerleave', raycast.onMouseLeave);
      element.removeEventListener('pointermove', raycast.onMouseMove);
    };
  }, [raycast]);
}