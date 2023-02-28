// @flow strict

/*::
import type { Component } from "@lukekaalim/act";
*/

import { TreeEditor } from "@astral-atlas/wildspace-components/editor/TreeEditor/TreeEditor"
import { TreeEditorRowTag } from "@astral-atlas/wildspace-components/editor/TreeEditor/TreeEditorRowTag";
import { TreeEditorRow } from "@astral-atlas/wildspace-components/editor/TreeEditor/TreeEditorRow";
import { h, useMemo } from "@lukekaalim/act"
import { v4 } from "uuid";

const createRandomNode = (depth = 3) => {
  const childCount = Math.max(0, Math.floor(Math.random() * 2) + 1);

  const children = depth < 1
    ? []
    : Array.from({ length: childCount })
        .map(() => createRandomNode(depth - 1))

  return {
    id: v4(),
    name: 'Node',
    children,
  };
}

const tag = h('div', { style: { padding: '2px', backgroundColor: 'red', color: 'white', borderRadius: '4px', margin: '4px' } }, 'Tag')

export const TreeEditorDemo/*: Component<>*/ = () => {
  const rootNodes = useMemo(() => createRandomNode().children, []);

  return [
    h('div', { style: { display: 'flex', flexDirection: 'column' } }, [
      h(TreeEditorRow, { selected: true, expanded: true, externalChildren: tag },
        h('div', { style: { margin: 'auto', height: '60px' } }, 'Hello')),
      h(TreeEditorRow, { selected: true, depth: 2 }, 'Hello'),
      h(TreeEditorRow, { selected: true, title: 'hello', depth: 1 }, 'Hello'),
    ]),

    h(TreeEditor, { rootNodes, selectedNodes: new Set() }),
  ]
}