// @flow strict
/*::
import type { BufferStore } from "./buffer";
import type { Table } from "./table";
import type { Cast } from "@lukekaalim/cast";
*/

import { c } from "@lukekaalim/cast";
import { createBufferTable } from "./table.js";

/*::
export type ExpiryTable<Value> = {
  get: (key: string, time: number) => Promise<{ result: Value | null }>,
  set: (key: string, value: Value | null, expires: number) => Promise<void>,
}
*/

export const createExpiryTable = /*:: <Value>*/(
  store/*: BufferStore*/,
  castValue/*: Cast<Value>*/
)/*: ExpiryTable<Value>*/ => {
  const castExpiryValue = c.obj({ expires: c.num, value: castValue })
  const internalTable = createBufferTable(store, castExpiryValue);
  const get = async (key, time) => {
    const { result } = await internalTable.get(key);
    if (!result)
      return { result: null };
    if (time >= result.expires)
      return { result: null }
    return { result: result.value }
  };
  const set = async (key, value, expires) => {
    const expiryValue = { expires, value }
    await internalTable.set(key, expiryValue);
  };
  return { get, set }
};
