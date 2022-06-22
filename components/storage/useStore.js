// @flow strict
/*::
import type { Store } from "./store";
import type { SetValue } from "@lukekaalim/act";
*/

import { useEffect, useState } from "@lukekaalim/act"

export const useStore = /*:: <T>*/(store/*: Store<T>*/)/*: [T, SetValue<T>]*/ => {
  const [value, setValue] = useState/*:: <T>*/(() => store.get());
  useEffect(() => store.subscribe(setValue), [store]);

  const setItem = (updater) => {
    if (typeof updater === 'function')
      // $FlowFixMe
      store.set(updater(store.get()))
    else
      store.set(updater);
  }

  return [value, setItem];
}