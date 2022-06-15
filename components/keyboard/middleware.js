// @flow strict
/*::
import type { KeyboardStateEmitter } from "./changes";
import type { KeyboardState } from "./state";
*/

import { isKeyboardStateEqual } from "./changes";

import { useMemo } from "@lukekaalim/act";

export const useKeyboardStateEmitterMiddleware = (
  emitter/*: ?KeyboardStateEmitter*/ = null,
  middleware/*: (state: KeyboardState, event: FocusEvent | KeyboardEvent) => KeyboardState*/,
  deps/*: mixed[]*/ = [],
)/*: KeyboardStateEmitter*/ => {
  return useMemo(() => {
    const subscribe = (subscriber) => {
      if (!emitter)
        return () => {};
      
      return emitter.subscribe((prevState, event) => {
        const nextState = middleware(prevState, event)
        subscriber(nextState, event);
      })
    }
  
    return {
      subscribe,
    }
  }, [emitter, middleware, ...deps])
}