// @flow strict
/*::
import type { BufferStore } from "./buffer";
import type { Page, Table, CompositeKey } from "./table";
import type { Cast } from "@lukekaalim/cast";

import type { DynamoDB } from "@aws-sdk/client-dynamodb";
*/

import { c, castString } from "@lukekaalim/cast";
import { createBufferTable } from "./table.js";
import {
  readValueTypes,
  writeObjectAttributes,
  writeValueTypes,
} from "./table.js";
import {
  createFaultTolerantArrayCaster,
  readDynamoDBItem,
  writeDynamoDBItem,
} from "./table.js";


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

/*::
export type ExpirableCompositeTable<PK, SK, V: {}> = {
  get: (key: CompositeKey<PK, SK>) => Promise<{ result: null } | { result: V, expires: number }>,
  set: (key: CompositeKey<PK, SK>, value: V | null, expires: number) => Promise<void>,
  query: (partition: PK) => Promise<{ results: $ReadOnlyArray<{ key: SK, value: V, expires: number }>}>
}
*/

export const createDynamoDBExpirableTable = /*:: <V: {}>*/(
  dynamodb/*: DynamoDB*/,
  tableName/*: string*/,
  castItem/*: Cast<V>*/,
  partitionKeyName/*: string*/,
  sortKeyName/*: string*/,
  expiryKey/*: string*/
)/*: ExpirableCompositeTable<string, string, V>*/ => {
  const get = async (key) => {
    const { Item } = await dynamodb.getItem({
      TableName: tableName,
      Key: {
        [partitionKeyName]: { S: key.partition },
        [sortKeyName]: { S: key.sort }
      }
    });
    if (!Item)
      return { result: null }
    const value = readDynamoDBItem(Item);
    const result = castItem(value);
    const expires = c.num(value[expiryKey]);
    return { result: (result/*: V*/), expires }
  };

  const remove = async (key) => {
    await dynamodb.deleteItem({
      TableName: tableName,
      Key: {
        [partitionKeyName]: key.partition,
        [sortKeyName]: key.sort,
      }
    })
  }

  const set = async (key, value, expires) => {
    if (value === null)
      return remove(key);
    await dynamodb.putItem({
      TableName: tableName,
      Item: writeDynamoDBItem({
        ...value,
        [partitionKeyName]: key.partition,
        [sortKeyName]: key.sort,
        [expiryKey]: expires ,
      }),
    });
  }

  const query = async (partitionKey) => {
    const { Items } = await dynamodb.query({
      TableName: tableName,
      
      FilterExpression: '#exp < :expiry_cutoff',
      KeyConditionExpression: `#pkn=:pk`,
      ExpressionAttributeNames: {
        [`#pkn`]: partitionKeyName,
        [`#exp`]: expiryKey,
      },
      ExpressionAttributeValues: {
        [`:pk`]: { S: partitionKey },
        [`:expiry_cutoff`]: { N: (Date.now() * 1000).toString() },
      }
    });

    const results = Items
      .map(item => readDynamoDBItem(item))
      .map(item => {
        const expires = c.num(item[expiryKey]);
        const key = c.str(item[sortKeyName]);
        const value = castItem(item);
        return { expires, key, value };
      });

    return { results };
  }

  return {
    get,
    set,
    query
  }
}

/*::
export type ExpiryTransactable<PK, SK, I: {}> = {
  get: (key: CompositeKey<PK, SK>) => Promise<{ result: null } | { result: I, version: mixed, expiresBy: number }>,
  set: (key: CompositeKey<PK, SK>, version: mixed, expiresBy: number, item: I | null) => Promise<void>
};
*/

export const createDynamoDBExpiryTransactable = /*:: <I: {}>*/(
  dynamodb/*: DynamoDB*/,
  tableName/*: string*/,
  castItem/*: Cast<I>*/,

  partitionKeyName/*: string*/,
  sortKeyName/*: string*/,
  versionKeyName/*: string*/,
  expiryKeyName/*: string*/
)/*: ExpiryTransactable<string, string, I>*/ => {
  const get = async (key) => {
    const { Item } = await dynamodb.getItem({
      TableName: tableName,
      Key: {
        [partitionKeyName]: { S: key.partition },
        [sortKeyName]: { S: key.sort }
      }
    });
    if (!Item)
      return { result: null }
    const value = readDynamoDBItem(Item);
    const result = castItem(value);
    const expiresBy = c.num(value[expiryKeyName]);
    const version = value[versionKeyName];
    return { result: (result/*: I*/), expiresBy, version }
  };
  const remove = async (key) => {
    await dynamodb.deleteItem({
      TableName: tableName,
      Key: {
        [partitionKeyName]: key.partition,
        [sortKeyName]: key.sort,
      }
    })
  }
  const set = async (key, version, expiresBy, item) => {
    if (item === null)
      return remove(key);
    await dynamodb.putItem({
      TableName: tableName,
      Item: writeDynamoDBItem({
        ...item,
        [partitionKeyName]: key.partition,
        [sortKeyName]: key.sort,
        [expiryKeyName]: expiresBy,
        [versionKeyName]: version
      }),
      ConditionExpression:  '#v = :v',
      ExpressionAttributeNames: { '#v': versionKeyName },
      ExpressionAttributeValues: { ':v': writeValueTypes(version) }
    });
  };
  return { get, set };
}

export const createMemoryExpiryTransactable = ()/*: ExpiryTransactable<any, any, any, any>*/ => {
  throw new Error();
}