// @flow strict

import { useMemo, useState } from "@lukekaalim/act";

/*::
export type LibrarySelection = {
  replace: (id: string[]) => void,
  toggle: (id: string) => void,
  selected: Set<string>,
};
*/

export const useLibrarySelection = (initialSelection/*: string[]*/ = [])/*: LibrarySelection*/ => {
  const [selected, setSelected] = useState/*:: <Set<string>>*/(() => new Set(initialSelection));

  const replace = (ids) => {
    setSelected(new Set(ids));
  };
  const toggle = (id) => {
    setSelected(selected => new Set(selected.has(id) ?
      [...selected].filter(s => s !== id) :
      [...selected, id]));
  }

  return useMemo(() => ({
    replace,
    toggle,
    selected,
  }), [selected])
};