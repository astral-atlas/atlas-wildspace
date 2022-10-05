// @flow strict
/*::
import type { VersionedTable } from "./meta";
import type { CompositeTable, CompositeKey } from "./table";
import type { DynamoDB, DynamoDBValueType } from "@aws-sdk/client-dynamodb";
import type { Cast } from "@lukekaalim/cast";
*/

import {
  readValueTypes,
  writeObjectAttributes,
  writeValueTypes,
} from "./table.js";

/*::
export type Transactable<PK, SK, V: {}> = {|
  transaction(
    partitionKey: PK,
    sorkKey: SK,
    updater: (input: V) => V | Promise<V>,
    retries?: number,
    defaultValue?: ?V,
  ): Promise<{ prev: V, next: V }>,
|}
*/

export const createDynamoDBTrasactable = /*:: <V: {}>*/(
  db/*: DynamoDB*/,
  tableName/*: string*/,
  castValue/*: Cast<V>*/,
  createKeyAttributes/*: (partitionKey: string, sortKey: string) => { +[string]: DynamoDBValueType }*/,
  versionKey/*: string*/,
)/*: Transactable<string, string, V>*/ => {
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
    const prevVersion = prevValue[versionKey]
    try {
      const nextValue = await updater(prevValue);
      const nextItem = {
        ...writeObjectAttributes(nextValue),
        ...Key,
      };
      await db.putItem({
        Item: nextItem,
        TableName: tableName,
        ...(defaultValue !== prevValue ? {
          // Ensure that the we are only allowed to overwrite the "previous version"
          ConditionExpression:  '#v = :v',
          ExpressionAttributeNames: { '#v': versionKey },
          ExpressionAttributeValues: { ':v': writeValueTypes(prevVersion) }
        } : {}),
      });
      return { prev: prevValue, next: nextValue };
    } catch (error) {
      if (retries < 1)
        throw error;
      console.warn('Retrying transaction')
      return transaction(partitionKey, sortKey, updater, retries - 1, defaultValue);
    }
  }
  return {
    transaction,
  };
};

export const createFakeTransactable = /*:: <V: {}>*/(
  table/*: CompositeTable<string, string, V>*/,
)/*: Transactable<string, string , V>*/ => {
  const transaction = async (pk, sk, updater, retries, defaultValue) => {
    const { result: prev } = await table.get(pk, sk);
    const defaultOrPrev = prev || defaultValue;
    if (!defaultOrPrev)
      throw new Error();
    const next = await updater(defaultOrPrev);
    await table.set(pk, sk, next);
    return { prev: defaultOrPrev, next };
  };
  return {
    transaction,
  }
}

/*::
export type Optional<T> = $ObjMap<T, <P>(prop: P) => void | P>;

export type Updatable<PK, SK, V: {}> = {
  updateSet: (key: CompositeKey<PK, SK>, value: Optional<V>) => Promise<void>,
}
*/

export const createFakeUpdatable = /*:: <PK, SK, V: {}>*/(
  table/*: CompositeTable<PK, SK, V>*/,
  handleUpdate/*: (prev: V, next: Optional<V>) => V*/,
)/*: Updatable<PK, SK, V>*/ => {
  const updateSet = async (key, value) => {
    const { result } = await table.get(key.partition, key.sort);
    if (result === null)
      throw new Error();
    await table.set(key.partition, key.sort, handleUpdate(result, value));
  };
  return { updateSet };
}

export const createDynamoDBUpdatable = /*:: <V: {}>*/(
  db/*: DynamoDB*/,
  tableName/*: string*/,
  castValue/*: Cast<V>*/,
  paritionKey/*: string*/,
  sortKey/*: string*/,
  versionKey/*: string*/,
)/*: Updatable<string, string, V>*/ => {
  const updateSet = async (key, value) => {
    
  };
  return { updateSet };
}