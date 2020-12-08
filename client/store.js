// @flow strict
/*:: import type { RESTClient } from './rest'; */ 
/*:: import type { JSONValue } from './json'; */ 

/*::
type Store = {
  id: string,
  values: { key: string, value: mixed }[],
};

type StoreClient = {
  listStoreIds: () => Promise<string[]>,
  getStore: (storeId: string) => Promise<Store>,
  setStoreValue: (storeId: string, key: string, value: JSONValue) => Promise<Store>,
};

export type {
  StoreClient,
  Store,
};
*/

const toString = (value/*: mixed*/)/*: string*/ => {
  if (typeof value !== 'string') {
    throw new TypeError(); 
  }
  return value;
};
const toArray = (value/*: mixed*/)/*: $ReadOnlyArray<mixed>*/ => {
  if (!Array.isArray(value))
    throw new TypeError();
  return value;
};
const toObject = (value/*: mixed*/)/*: { +[string]: mixed }*/ => {
  if (typeof value !== 'object' || value === null)
    throw new TypeError();
  return value;
}
const toStore = (value/*: mixed*/)/*: Store*/ => {
  const object = toObject(value);
    
  return {
    id: toString(object['id']),
    values: toArray(object['values']).map(v => {
      const object = toObject(v);
      return {
        key: toString(object['key']),
        value: object['value'],
      };
    })
  };
}

const createStoreClient = (rest/*: RESTClient*/)/*: StoreClient*/ => {
  const listStoreIds = async () => {
    const { content } = await rest.get({ resource: '/stores/ids', });
    const ids = toArray(content).map(toString);
    return ids;
  };
  const getStore = async (storeId) => {
    const { content } = await rest.get({ resource: '/stores', params: { storeId } });
    const store = toStore(content);
    return store;
  };
  const setStoreValue = async (storeId, key, value) => {
    const params = {
      resource: '/stores/value',
      params: { storeId, key },
      content: value,
    };
    const { content } = await rest.put(params);
    const updatedStore = toStore(content);
    return updatedStore;
  };
  return {
    listStoreIds,
    getStore,
    setStoreValue,
  };
};

module.exports = {
  createStoreClient,
};
