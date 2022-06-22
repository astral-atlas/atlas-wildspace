// @flow strict
/*::
import type { ElementNode, Component } from "@lukekaalim/act";
*/
import { useMemo, useState } from "@lukekaalim/act";

/*::
export type PopupComponent = Component<{
  onClose: () => void,
}>;
export type PopupEntry = {
  element: PopupComponent,
};

export type PopupStackController = {
  stack: PopupEntry[],
  push: (entry: PopupEntry) => void,
  pop: () => void,
};
*/


export const usePopupStack = ()/*: PopupStackController*/ => {
  const [stack, setStack] = useState/*:: <PopupEntry[]>*/([]);

  const push = (entry) => {
    setStack(s => [...s, entry])
  }
  const pop = () => {
    setStack(s => s.slice(0, -1))
  }

  return useMemo(() => ({
    stack,
    push,
    pop
  }), [stack]);
};
