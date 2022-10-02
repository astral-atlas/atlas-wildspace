// @flow strict
/*::
import type { LoopController } from "../three/useLoopController";
import type { RaycastManager } from "./manager";
*/
import { useEffect } from "@lukekaalim/act";

export const useRaycastLoop = (raycast/*: RaycastManager*/, loop/*: LoopController*/) => {
  useEffect(() => {
    const unsubscribe = loop.subscribeInput((c, v) => raycast.onUpdate(c.camera));
    return unsubscribe;
  }, [raycast, loop])
}