# Tree Graph Column

The Tree Editor is a generic component for displaying
tree graphs in a column, which each node being a row
inside the column.

```ts
import { Component } from '@lukekaalim/act';

declare export const TreeGraphColumn: Component<{
  rootNodes: TreeGraphColumnNode[],
  selectedNodes: Set<TreeGraphColumnNodeID>,
  renderNode: RenderNodeFunc
}>;
```

`TreeGraphColumnNode` is a small data structure
that just identifies itself and it's children.

The `RenderNodeFunc` is ultimatley used to actually render
the rows in the column.

```ts
import { ElementNode } from '@lukekaalim/act';

type TreeGraphColumnNodeID = string;
type TreeGraphColumnNode = {
  id: TreeGraphColumnNodeID,
  children: TreeGraphColumnNode[],
}

type RenderNodeFunc = (renderedNodeSettings: {
  hidden: boolean,
  id: TreeGraphColumnNodeID,
  depth: number,
  showExpanded: boolean,
  expanded: boolean,
  onExpandedChange: (expanded: boolean): mixed,
}): ElementNode
```

::TreeGraphColumnDemo

## Implementations

 - [Resource Model Tree Editor](../input/resourceModel)