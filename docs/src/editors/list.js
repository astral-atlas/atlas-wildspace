// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */

import { OrderedListEditor } from "@astral-atlas/wildspace-components"
import { h, useState, useEffect } from "@lukekaalim/act"

const DemoEntryEditor = (itemIds) => ({ id }) => {
  return [id];
}

export const ListEditorDemo/*: Component<>*/ = () => {
  const [itemsIds, setItemIds] = useState/*:: <string[]>*/([0, 1, 2, 3, 4, 5, 6].map(n => n.toString()))
  const onItemIdsChange = (nextIds) => {
    setItemIds(nextIds);
  };
  return h('div', { style: { overflowY: 'auto' } },
    h(OrderedListEditor, { itemsIds, onItemIdsChange, EntryComponent: DemoEntryEditor(itemsIds) }));
}