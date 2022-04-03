// @flow strict

import { useEffect, useState } from "@lukekaalim/act";
import { v4 as uuid } from 'uuid';

export const useTrackedKeys = /*:: <T>*/(
  keys/*: $ReadOnlyArray<T>*/,
  deps/*: mixed[]*/ = [],
)/*: { id: string, key: T }[]*/ => {
  const [trackedKeys, setTrackedKeys] = useState/*:: <{ id: string, key: T }[]>*/([]);
  useEffect(() => {
    setTrackedKeys(prev => {
      const next = [];
      for (const key of keys) {
        const prevItem = prev.find(item =>
          item.key === key &&
          !next.find(nextItem => nextItem.id === item.id));
        if (prevItem) {
          next.push(prevItem);
        } else {
          next.push({ id: uuid(), key })
        }
      }
      return next;
    })
  }, [keys, ...deps])
  return trackedKeys;
}
