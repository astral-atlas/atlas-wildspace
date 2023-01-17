// @flow strict

/*::
import type { ProseMirrorJSONNode } from "prosemirror-model";
import type { InventoryItemTypeID } from "./inventoryItemType";
import type { Cast } from "@lukekaalim/cast";
*/

import { c } from "@lukekaalim/cast";
import { castInventoryItemTypeId } from "./inventoryItemType.js";
import { castProseMirrorJSONNode } from "../../prose.js";

/*::
export type InventoryItemID = string;
export type InventoryItem = {
  id: InventoryItemID,
  itemType: InventoryItemTypeID,

  quantity: number,
};
*/

export const castInventoryItemId/*: Cast<InventoryItemID>*/ = c.str;
export const castInventoryItem/*: Cast<InventoryItem>*/ = c.obj({
  id: castInventoryItemId,
  itemType: castInventoryItemTypeId,

  quantity: c.num,
})