// @flow strict

/*::
import type { Component } from "@lukekaalim/act";
*/

import { TreeEditor } from "@astral-atlas/wildspace-components/editor/TreeEditor/TreeEditor"
import { h, useMemo } from "@lukekaalim/act"
import { v4 } from "uuid";

const createRandomNode = (depth = 5) => {
  const childCount = Math.max(0, Math.floor(Math.random() * 3) + 1);

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

export const TreeEditorDemo/*: Component<>*/ = () => {
  const rootNodes = useMemo(() => createRandomNode().children, []);

  return [
    h(TreeEditor, { rootNodes, selectedNodes: new Set() }),
  ]
}