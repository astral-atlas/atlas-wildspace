// @flow strict
/*::
import type { BufferStore } from "./buffer";
import type { Table } from "./table";
import type { Cast } from "@lukekaalim/cast";
*/

import { c } from "@lukekaalim/cast";
import { createBufferTable } from "./table.js";
import type { CompositeKey } from "./key";
import type { DynamoDB } from "@aws-sdk/client-dynamodb";

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
export type Expirable<V: {}> = {
  queryUnexpired: (partitionKey: string) => null,
  expire: (key: CompositeKey<string, string>) => null,
  expireTTL: (key: CompositeKey<string, string>, ttl: number) => null,
  set: (key: CompositeKey<string, string>, value: number, expiry: number) => null,
}
*/

export const createDynamoDBExpirable = /*:: <V: {}>*/(
  dynamodb/*: DynamoDB*/,
  tableName/*: string*/,
  castValue/*: Cast<V>*/,
  partitionKey/*: string*/,
  sortKey/*: string*/,
  expiryKey/*: string*/
)/*: Expirable<V>*/ => {
  const queryUnexpired = async (key) => {
    dynamodb.query({
      TableName: tableName,
      
      KeyConditionExpression: `#pkn=:pk`,
      ExpressionAttributeNames: {
        [`#pkn`]: partitionKeyName,
      },
      ExpressionAttributeValues: {
        [`:pk`]: { S: createPK(pk) },
      }
    });
  }

  return {

  }
}