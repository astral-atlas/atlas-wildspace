// @flow strict
/*::
import type { Ref } from "@lukekaalim/act/hooks";
import type { Object3D } from "three";
*/

import { useEffect, useState } from "@lukekaalim/act";

export const useChildObject = /*:: <T: Object3D>*/(
  parentRef/*: Ref<?Object3D>*/,
  createChild/*: (parent: Object3D) => ?T*/,
  deps/*: mixed[]*/ = []
)/*: ?T*/ => {
  const [child, setChild] = useState();
  useEffect(() => {
    const { current: parent } = parentRef;
    if (!parent)
      return;
    const child = createChild(parent);
    if (!child)
      return;

    parent.add(child);
    setChild(child)
    return () => {
      child.removeFromParent();
      setChild(null);
    }
  }, deps);

  return child;
};