// @flow strict
/*::
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "./useMiniTheaterController2";
*/

import { useEffect, useState } from "@lukekaalim/act"

export const useMiniTheaterState = (
  controller/*: ?MiniTheaterController2*/
)/*: ?MiniTheaterLocalState*/ => {
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!controller)
      return;
    const { unsubscribe } =  controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);
  return state;
}