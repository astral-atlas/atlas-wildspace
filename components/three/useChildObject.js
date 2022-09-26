// @flow strict
/*::
import type { Ref } from "@lukekaalim/act/hooks";
import type { Object3D } from "three";
*/

import { useEffect, useState } from "@lukekaalim/act";

export const useChildObject = /*:: <T: Object3D>*/(
  parentRef/*: Ref<?Object3D>*/,
  createChild/*: () => T*/,
  deps/*: mixed[]*/ = []
)/*: ?T*/ => {
  const [child, setChild] = useState();
  useEffect(() => {
    const { current: parent } = parentRef;
    if (!parent)
      return null;
    const child = createChild();
    parent.add(child);
    setChild(child)
    return () => {
      child.removeFromParent();
      setChild(null);
    }
  }, deps);

  return child;
};