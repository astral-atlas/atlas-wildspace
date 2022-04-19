// @flow strict
/*:: import type { Ref } from '@lukekaalim/act'; */
import { useRef } from "@lukekaalim/act";

/*::
export type KeyboardState = Set<string>;
*/

/*::
type KeyboardStateFunction = (event: KeyboardEvent) => Set<string>;
type KeyboardStateEvents = {
  up: KeyboardStateFunction,
  down: KeyboardStateFunction,
}
*/

export const useKeyboardState = (
  validKeys/*: ?Set<string>*/ = null,
  onStateChange/*: ?((nextKeys: Set<string>, event: KeyboardEvent) => mixed)*/ = null
)/*: [Ref<KeyboardState>, KeyboardStateEvents]*/ => {
  const keysRef = useRef(new Set());

  const isValidEvent = (event) => {
    if (event.code === 'CapsLock')
      return false;
    if (validKeys && !validKeys.has(event.code))
      return false;
    return true;
  }
  const down = (e) => {
    if (isValidEvent(e)) {
      e.preventDefault();
      if (!e.repeat) {
        keysRef.current.add(e.code);
        if (onStateChange)
          onStateChange(new Set(keysRef.current), e);
      }
    }
    return keysRef.current;
  };
  const up = (e) => {
    if (isValidEvent(e)) {
      e.preventDefault();
      keysRef.current.delete(e.code);
      if (onStateChange)
        onStateChange(new Set(keysRef.current), e);
    }
    return keysRef.current;
  };

  return [keysRef, { down, up }];
};