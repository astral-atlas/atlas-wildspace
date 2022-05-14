// @flow strict
/*:: import type { JSONValue, Cast } from '@lukekaalim/cast'; */
/*::
import type { DynamoDB, DynamoDBValueType } from '@aws-sdk/client-dynamodb'
*/

/*:: import type { BufferStore } from './buffer.js'; */
import { c, castArray } from '@lukekaalim/cast';
import { createLockFunction } from './lock.js';

/*::
export type Page<Key, Value> = { result: $ReadOnlyArray<Value>, keys: Key[], next: Key | null };

export type Table<Key, Value> = {
  get: (key: Key) => Promise<{ result: Value | null }>,
  set: (key: Key, value: null | Value) => Promise<void>,
  scan: (from?: null | Key, limit?: null | number) => Promise<Page<Key, Value>>
};

export type CompositeTable<PartitionKey, SortKey, Value> = {|
  get: (partition: PartitionKey, sort: SortKey) => Promise<{ result: Value | null }>,
  set: (partition: PartitionKey, sort: SortKey, value: null | Value) => Promise<void>,
  scan: (from?: { partition?: ?PartitionKey, sort?: ?SortKey }, limit?: null | number) => Promise<Page<{ partition: PartitionKey, sort: SortKey }, Value>>,
  query: (partition: PartitionKey) => Promise<Page<SortKey, Value>>
|};
*/

const createFaultTolerantArrayCaster = /*:: <T, I = mixed>*/(
  castRow/*: Cast<T>*/
)/*: ($ReadOnlyArray<I> => [$ReadOnlyArray<T>, $ReadOnlyArray<I>])*/ => {
  const castFaultTolerantArray = (array) => {
    const values = [];
    const rejects = [];
    for (const element of array)
      try {
        values.push(castRow(element));
      } catch (error) { console.warn(error.message); rejects.push(element); }
    return [values, rejects];
  };
  return castFaultTolerantArray
};

export const createMemoryTableLock = /*:: <K, V>*/(table/*: Table<K, V>*/)/*: Table<K, V>*/ => {
  const lockedSet = createLockFunction(({ k, v }) => table.set(k, v));
  return {
    ...table,
    set: (k, v) => lockedSet({ k, v})
  }
};
export const createMemoryCompositeTableLock = /*:: <P, S, V>*/(table/*: CompositeTable<P, S, V>*/)/*: CompositeTable<P, S, V>*/ => {
  const lockedSet = createLockFunction(({ p, s, v }) => table.set(p, s, v));
  return {
    ...table,
    set: (p, s, v) => lockedSet({ p, s, v })
  }
};

export const createBufferTable = /*:: <T>*/(store/*: BufferStore*/, castValue/*: Cast<T>*/)/*: Table<string, T>*/ => {
  const castTable = createFaultTolerantArrayCaster(c.obj({ key: c.str, value: castValue }));
  const loadTable = async () => {
    try {
      const buffer = await store.get()
      const [table] = castTable(JSON.parse(buffer.toString('utf8')))
      return table;
    } catch (error) {
      return [];
    }
  };
  const get = async (key) => {
    const table = await loadTable();
    const entry = table.find(e => e.key === key) || null;
    return { result: entry && entry.value };
  };
  const set = async (key, newValue) => {
    const table = await loadTable();
    const updatedTable = newValue ?
    [...table.filter(e => e.key !== key), { key, value: newValue }] :
      table.filter(e => e.key !== key);
    await store.set(Buffer.from(JSON.stringify(updatedTable, null, 2)));
  };
  const scan = async () => {
    const table = await loadTable();
    // TODO: this is broken!
    return { result: table.map(e => e.value), keys: table.map(e => e.key), next: null };
  }
  return createMemoryTableLock({ get, set, scan, });
};
export const createBufferCompositeTable = /*:: <T>*/(
  store/*: BufferStore*/,
  castValue/*: Cast<T>*/
)/*: CompositeTable<string, string, T>*/ => {
  const castTable = createFaultTolerantArrayCaster(c.obj({ partition: c.str, sort: c.str, value: castValue }));
  const matchEntry = (partition, sort, e) => (e.partition === partition && e.sort === sort);
  const loadTable = async () => {
    try {
      const buffer = await store.get()
      const table = castTable(JSON.parse(buffer.toString('utf8')))
      return table;
    } catch (error) {
      return [];
    }
  };
  const get = async (partition, sort) => {
    const [table] = await loadTable();
    const entry = table.find(e => matchEntry(partition, sort, e)) || null;
    return { result: entry && entry.value };
  }
  const set = async (partition, sort, newValue) => {
    const [table] = await loadTable();
    const updatedTable = newValue ?
      [...table.filter(e => !matchEntry(partition, sort, e)), { partition, sort, value: newValue }] :
      table.filter(e => !matchEntry(partition, sort, e));
    await store.set(Buffer.from(JSON.stringify(updatedTable, null, 2)));
  }
  const scan = async ({ partition = null, sort } = {}, limit) => {
    // we assume buffer tables have no limit
    const [table] = await loadTable();
    // TODO: this is broken!
    const validKeys = table
      .filter(e => !partition || e.partition === partition);
    const result = validKeys.map(e => e.value);
    const keys = validKeys.map(e => ({ partition: e.partition, sort: e.sort }))
    return { result, keys, next: null };
  };
  const query = async (partition) => {
    const [table] = await loadTable();
    const entries = table
      .filter(e => e.partition === partition)
    const result = entries.map(e => e.value);
    const keys = entries.map(e => e.sort)
    return { result, keys, next: null };
  };
  return createMemoryCompositeTableLock({ get, set, scan, query });
};

export const writeObjectAttributes = (value/*: { +[string]: mixed } */)/*: { +[string]: DynamoDBValueType }*/ => {
  const entries = Object
    .entries(value)
    .map(([name, value]) => [name, writeValueTypes(value)])
  return Object.fromEntries(entries);
}

export const writeValueTypes = (value/*: mixed*/)/*: DynamoDBValueType*/ => {
  switch (typeof value) {
    case 'string':
      return { S: value };
    case 'number':
      return { N: value.toString() };
    case 'boolean':
      return { BOOL: value };
    case 'object':
      if (value === null)
        return { NULL: true };
      else if (Array.isArray(value))
        return { L: value.map(writeValueTypes) }
      else
        return { M: writeObjectAttributes(value) };
    case 'undefined':
      return { NULL: true };
    default:
      console.log(value);
      throw new Error();
  }
}
export const readValueTypes = (value/*: DynamoDBValueType*/)/*: mixed*/ => {
  if ('S' in value)
  // $FlowFixMe
    return value.S;
  else if ('N' in value)
  // $FlowFixMe
    return Number.parseFloat(value.N);
  else if ('BOOL' in value)
  // $FlowFixMe
    return value.BOOL;
  else if ('NULL' in value)
    return null
  else if ('M' in value) {
    //console.log(value);
    // $FlowFixMe
    return Object.fromEntries(Object.entries(value.M).map(([name, type]) => [name, readValueTypes(type)]));
  } else if ('L' in value) {
    //console.log(value);
    // $FlowFixMe
    return value.L.map(readValueTypes);
  }
  
  throw new Error();
}

export const createDynamoDBCompositeTable = /*:: <PartitionKey, SortKey, Item>*/(
  tableName/*: string*/,
  partitionKeyName/*: string*/,
  sortKeyName/*: string*/,
  createPK/*: PartitionKey => string*/,
  createSK/*: SortKey => string*/,
  castItem/*: Cast<Item>*/,
  client/*: DynamoDB*/,
)/*: CompositeTable<PartitionKey, SortKey, Item>*/ => {

  const get = async (pk, sk) => {
    try {
      const { Item } = await client.getItem({
        TableName: tableName,
        Key: { [partitionKeyName]: { S: createPK(pk) }, [sortKeyName]: { S: createSK(sk) } }
      });
      if (!Item)
        return { result: null };
      const result = castItem(readValueTypes({ M: Item }));
      return { result };
    } catch (error) {
      console.warn(error);
      return { result: null };
    }
  };
  const set = async (pk, sk, item) => {
    const key = {
      [partitionKeyName]: { S: createPK(pk) },
      [sortKeyName]: { S: createSK(sk) },
    }

    if (!item)
      return void await client.deleteItem({ TableName: tableName, Key: key });
    const Item = {
      ...Object.fromEntries(Object.entries(item).map(([name, value]) => [name, writeValueTypes(value)])),
      ...key,
    };
    await client.putItem({ TableName: tableName, Item })
  };
  const scan = async () => {
    const { Items } = await client.scan({ TableName: tableName })
    const result = Items.map(item => readValueTypes({ M: item })).map(castItem);
    return { result, keys: [], next: null };
  };
  const castQuery = createFaultTolerantArrayCaster(castItem);
  const query = async (pk) => {
    const { Items } = await client.query({
      TableName: tableName,
      KeyConditionExpression: `#pkn=:pk`,
      ExpressionAttributeNames: {
        [`#pkn`]: partitionKeyName,
      },
      ExpressionAttributeValues: {
        [`:pk`]: { S: createPK(pk) },
      }
    })
    const itemValue = Items.map(item => readValueTypes({ M: item }))
    const keys/*: any*/ = itemValue.map(item => (typeof item === 'object' && item) ? item[sortKeyName] : '<NONE>')
    const [result, rejects] = castQuery(itemValue);
    /*
    if (rejects.length > 0) {
      await client.batchWriteItem({ RequestItems: {
        [tableName]: rejects.map(r => {
          const index = itemValue.indexOf(r);
          const item = Items[index];
          const action = {
            DeleteRequest: {
              Key: {
                [partitionKeyName]: item[partitionKeyName],
                [sortKeyName]: item[sortKeyName]
              }
            }
          }
          return action;
        }),
      }});
    }
    */
    return { result, keys, next: null };
  };
  return {
    get,
    set,
    scan,
    query,
  };
}

export const createDynamoDBSimpleTable = /*:: <Key, Item>*/(
  tableName/*: string*/,
  keyName/*: string*/,
  sortKeyName/*: string*/,
  createKey/*: Key => string*/,
  castItem/*: Cast<Item>*/,
  client/*: DynamoDB*/,
)/*: Table<Key, Item>*/ => {
  const get = async (key) => {
    const { Item } = await client.getItem({ TableName: tableName, Key: { [keyName]: { S: createKey(key) }, [sortKeyName]: { S: "_" } } })
    if (!Item)
      return { result: null };
    const result = castItem(readValueTypes({ M: Item }))
    return { result };
  };
  const scan = async () => {
    return { result: [], keys: [], next: null };
  };
  const set = async (key, item) => {
    if (!item)
      throw new Error();
    
    const Item = {
      ...Object.fromEntries(Object.entries(item).map(([name, value]) => [name, writeValueTypes(value)])),
      [keyName]: { S: createKey(key) },
      [sortKeyName]: { S: "_" }
    };
    console.log(Item);
    await client.putItem({ TableName: tableName, Item });
  };
  return { get, scan, set };
}

export const createFakeCompositeTable = ()/*: CompositeTable<any, any, any>*/ => {
  const get = () => {
    throw new Error()
  };
  const set = () => {
    throw new Error()
  };
  const scan = () => {
    throw new Error()
  };
  const query = () => {
    throw new Error()
  }
  return { get, set, scan, query };
}