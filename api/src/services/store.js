// @flow strict
/*:: import type { JSONValue } from '../json'; */

/*::
type StoreService<Key: string, Value: JSONValue> = {
  get: (key: Key) => Promise<Value | null>,
  set: (key: Key, value: Value | null) => Promise<void>,
};

type IndexService<Value: JSONValue> = {
  list: () => Promise<Value[]>,
};

type MemoryStore<K: string, V: JSONValue> = (
  StoreService<K, V> &
  IndexService<K> &
  { values: Iterable<[K, V]> }
);

export type {
  StoreService,
  IndexService,
  MemoryStore,
};
*/

const createMemoryStore = /*:: <Key: string, Value: JSONValue>*/(
  initialState/*: [Key, Value][]*/ = []
)/*: MemoryStore<Key, Value>*/ => {
  const values = new Map/*:: <Key, Value>*/(initialState);

  const get = async (key/*: Key*/) => {
    if (values.has(key))
      return values.get(key) || null;
    return null;
  };
  const set = async (key/*: Key*/, value/*: Value | null*/) => {
    if (value === null)
      return void values.delete(key);
    return void values.set(key, value);
  };
  const list = async () => {
    return [...values.keys()];
  };
  

  const store = { get, set };
  const index = { list };
  
  return {
    ...store,
    ...index,
    values,
  };
};

module.exports = {
  createMemoryStore,
};
