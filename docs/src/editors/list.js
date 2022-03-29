// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */

import { OrderedListEditor } from "@astral-atlas/wildspace-components"
import { h, useState, useEffect } from "@lukekaalim/act"

export const ListEditorDemo/*: Component<>*/ = () => {
  const [itemsIds, setItemIds] = useState/*:: <string[]>*/([0, 1, 2, 3, 4, 5, 6].map(n => n.toString()))
  const mix = () => {
    setItemIds(ids => ids
      .map(id => [id, Math.random()])
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
    )
  }
  const onIndexChange = (id) => (indexOffset) => {
    setItemIds(ids => {
      const prevIndex = ids.indexOf(id);
      const nextIndex = prevIndex + indexOffset;
      const filteredIds = ids.filter(i => i !== id);
      const nextIds = [
        ...filteredIds.slice(0, nextIndex),
        id,
        ...filteredIds.slice(nextIndex)
      ];
      return nextIds;
    })
  }
  return h('div', { style: { height: '600px', overflowY: 'auto' } }, h(OrderedListEditor, { itemsIds, onIndexChange }));
}