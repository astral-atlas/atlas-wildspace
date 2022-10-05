// @flow strict

import { useMemo, useState } from "@lukekaalim/act";

/*::
export type LibrarySelection = {
  replace: (id: string[]) => void,
  toggle: (id: string) => void,
  selected: Set<string>,
};
*/

export const useLibrarySelection = (
  initialSelection/*: string[]*/ = [],
  onSelectionChange/*: Set<string> => mixed*/ = _ => {},
  deps/*: mixed[]*/ = []
)/*: LibrarySelection*/ => {
  const [selected, setSelected] = useState/*:: <Set<string>>*/(() => new Set(initialSelection));

  const replace = (ids) => {
    const nextSelection = new Set(ids);
    setSelected(new Set(ids));
    onSelectionChange(nextSelection)
  };
  const toggle = (id) => {
    setSelected(selected => {
      const nextSelection = new Set(selected.has(id) ?
        [...selected].filter(s => s !== id) :
        [...selected, id])
      onSelectionChange(nextSelection)
      return nextSelection;
    });
  }

  return useMemo(() => ({
    replace,
    toggle,
    selected,
  }), [selected, ...deps])
};