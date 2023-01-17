// @flow strict
/*::
import type { GameMetaResource } from "../meta";
import type { InventoryItem } from "./inventoryItem";
import type { Cast } from "@lukekaalim/cast";
import type { ProseMirrorJSONNode } from "prosemirror-model";
*/

import { c } from "@lukekaalim/cast";

/*::
export type InventoryID = string;
export type Inventory = GameMetaResource<{|
  items: $ReadOnlyArray<InventoryItem>,
  description: ProseMirrorJSONNode,
|}, InventoryID>
*/

export const castInventoryId/*: Cast<InventoryID>*/ = c.str;