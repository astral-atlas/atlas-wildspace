// @flow strict

import { c } from "@lukekaalim/cast"

/*::
import type { BufferStore } from "./sources/buffer";
import type { CompositeTable } from "./sources/table";
import type { TableDataConstructors } from "./wildspace/table";
import type { UserID } from "@astral-atlas/sesame-models/src/user";
import { createBufferCompositeTable } from "./sources/table";

export type AssetData = {
  authorization: CompositeTable<UserID, string, { secret: string, expires: number }>,
};
*/

export const createTableAssetData = (tableConstuctors/*: TableDataConstructors*/)/*: AssetData*/ => {
  const authorization = tableConstuctors.createCompositeTable('assets_authorization', c.obj({ secret: c.str, expires: c.num }));

  return {
    authorization
  }
}

/*::
type DataConstructors = {
  createBufferStore: (name: string) => BufferStore,
}
*/
export const createBufferAssetData = (bufferConstructors/*: DataConstructors*/)/*: AssetData*/ => {
  const authorization = createBufferCompositeTable(
    bufferConstructors.createBufferStore('assets_authorization'),
    c.obj({ secret: c.str, expires: c.num })
  );

  return {
    authorization
  }
}