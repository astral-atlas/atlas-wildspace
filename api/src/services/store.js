// @flow strict
/*:: import type { JSONValue } from '../json'; */

/*::
type StoreService<Key, Value> = {
  get: (key: Key) => Promise<Value | null>,
  set: (key: Key, value: Value | null) => Promise<void>,
};

export type {
  StoreService,
};
*/

const createLocalStore = /*:: <Key: string, Value: JSONValue>*/(initialState/*: [Key, Value][]*/ = [])/*: StoreService<Key, Value>*/ => {
  const map = new Map/*:: <Key, Value>*/(initialState);

  const get = async (key/*: Key*/) => {
    if (map.has(key))
      return map.get(key) || null;
    return null;
  };
  const set = async (key/*: Key*/, value/*: Value | null*/) => {
    if (value === null)
      return void map.delete(key);
    return void map.set(key, value);
  };

  return {
    get,
    set,
  };
}

module.exports = {
  createLocalStore,
};
