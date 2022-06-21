// @flow strict
/*::
import type { VersionedTable } from "./meta";
import type { CompositeTable } from "./table";
import type { DynamoDB, DynamoDBValueType } from "@aws-sdk/client-dynamodb";
import type { Cast } from "@lukekaalim/cast";
*/

import {
  readValueTypes,
  writeObjectAttributes,
  writeValueTypes,
} from "./table.js";

/*::
export type Transactable<PK, SK, V> = {|
  transaction(
    partitionKey: PK,
    sorkKey: SK,
    updater: (input: V) => V | Promise<V>,
    retries?: number,
    defaultValue?: ?V,
  ): Promise<{ prev: V, next: V }>,
|}
*/

export const createDynamoDBTrasactable = /*:: <PK: string, SK: string, V: {}>*/(
  db/*: DynamoDB*/,
  tableName/*: string*/,
  castValue/*: Cast<V>*/,
  createKeyAttributes/*: (PK, SK) => { +[string]: DynamoDBValueType }*/,
  createVersionAttributes/*: (V) => { key: string, value: mixed }*/,
)/*: Transactable<PK, SK, V>*/ => {
  const getValueOrDefault = async (Key, defaultValue) => {
    try {
      const output =  await db.getItem({ TableName: tableName, Key });
      const prevValue = castValue(readValueTypes({ M: output.Item }));
      return prevValue;
    } catch (error) {
      if (defaultValue)
        return defaultValue;
      throw error;
    }
  }

  const transaction = async (partitionKey, sortKey, updater, retries = 0, defaultValue = null) => {
    const Key = createKeyAttributes(partitionKey, sortKey);
    const prevValue = await getValueOrDefault(Key, defaultValue);
    const version = createVersionAttributes(prevValue);
    try {
      const nextValue = await updater(prevValue);
      const nextItem = {
        ...writeObjectAttributes(nextValue),
        ...Key,
      };
      await db.putItem({
        Item: nextItem,
        TableName: tableName,
        ConditionExpression: '#v = :v',
        ExpressionAttributeNames: { '#v': version.key },
        ExpressionAttributeValues: { ':v': writeValueTypes(version.value) }
      });
      return { prev: prevValue, next: nextValue };
    } catch (error) {
      if (retries < 1)
        throw error;
      return transaction(partitionKey, sortKey, updater, retries - 1);
    }
  }
  return {
    transaction,
  };
};

export const createFakeTransactable = /*:: <V>*/(
  buffer/*: CompositeTable<string, string, V>*/,
)/*: Transactable<string, string , V>*/ => {
  const transaction = async (pk, sk, updater, retries, defaultValue) => {
    const { result: prev } = await buffer.get(pk, sk);
    const defaultOrPrev = prev || defaultValue;
    if (!defaultOrPrev)
      throw new Error();
    const next = await updater(defaultOrPrev);
    await buffer.set(pk, sk, next);
    return { prev: defaultOrPrev, next };
  };
  return {
    transaction,
  }
}
export const enhanceWithFakeTransactable = /*:: <V>*/(
  table/*: CompositeTable<string, string, V>*/,
)/*: VersionedTable<string, string, V>*/ => {
  const transactable = createFakeTransactable(table);
  return {
    ...table,
    ...transactable,
  };
}

/*::
export type Updateable<PK, SK, V> = {
  update(
    partitionKey: PK,
    sorkKey: SK,
    updater: (input: V) => V,
  ): Promise<{ input: V, output: V }>,
}
*/

/*::
export type Conditional<PK, SK, V> = {

}
*/