// @flow strict


/*::
import type { MagicItemID } from "../magicItem";
import type { GameMetaResource } from "../meta";
import type { Cast } from "@lukekaalim/cast/main";
import type { ProseMirrorJSONNode } from "prosemirror-model";
import type { InventoryID } from "./inventory";
*/

import { c } from "@lukekaalim/cast";
import { createTypedUnionCaster } from "../../castTypedUnion.js";
import { castGameMetaResource } from "../meta.js";
import { castProseMirrorJSONNode } from "../../prose.js";
import { castMagicItemId } from "../magicItem.js";
import { castInventoryId } from "./inventory.js";

/*::
export type InventoryItemTypeID = string;
export type InventoryItemType = GameMetaResource<{|
  itemDescription:
    | { type: 'currency' }
    | { type: 'simple', description: ProseMirrorJSONNode }
    | { type: 'magic-item', magicItemId: MagicItemID }
    | { type: 'inventory', inventoryId: InventoryID }
|}, InventoryItemTypeID>;
*/

export const castInventoryItemTypeId/*: Cast<InventoryItemTypeID>*/ = c.str;
export const castInventoryItemType/*: Cast<InventoryItemType>*/ = castGameMetaResource(castInventoryItemTypeId, c.obj({
  itemDescription: createTypedUnionCaster/*:: <InventoryItemType["itemDescription"]>*/((type, value) => {
    switch (type) {
      case 'currency':
        return { type: 'currency' };
      case 'simple':
        return { type: 'simple', description: castProseMirrorJSONNode(value.description) };
      case 'magic-item':
        return { type: 'magic-item', magicItemId: castMagicItemId(value.magicItemId) };
      case 'inventory':
        return { type: 'inventory', inventoryId: castInventoryId(value.inventoryId) }
    }
  })
}))