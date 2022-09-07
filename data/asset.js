// @flow strict

import { c } from "@lukekaalim/cast"
import { createBufferCompositeTable } from "./sources/table.js";

/*::
import type { BufferStore } from "./sources/buffer";
import type { CompositeTable } from "./sources/table";
import type { UserID } from "@astral-atlas/sesame-models/src/user";
import type { WildspaceDataSources } from "./sources";

export type AssetData = {
  authorization: CompositeTable<UserID, string, { secret: string, expires: number }>,
};
*/

export const createTableAssetData = (sources/*: WildspaceDataSources*/)/*: AssetData*/ => {
  const authorization = sources.createCompositeTable('assets_authorization', c.obj({ secret: c.str, expires: c.num }));

  return {
    authorization
  }
}
