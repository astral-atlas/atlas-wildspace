// @flow strict

import { useState } from "@lukekaalim/act";
/*::
export type SelectionActions<T> = {
  add: T[] => void,
  replace: T[] => void,
  remove: T[] => void,
}
*/

export const useSelection = /*:: <T>*/()/*: [T[], SelectionActions<T>]*/ => {
  const [selectedIds, setSelectedIds] = useState([])

  const add = (newSelectedIds) => {
    setSelectedIds([...new Set([...selectedIds, ...newSelectedIds])]);
  }
  const replace = (nextSelectedIds) => {
    setSelectedIds([...new Set(nextSelectedIds)]);
  };
  const remove = (removedSelectedIds) => {
    setSelectedIds(selectedIds.filter(id => !removedSelectedIds.includes(id)));
  }
  const actions = {
    add,
    replace,
    remove,
  }

  return [selectedIds, actions];
}