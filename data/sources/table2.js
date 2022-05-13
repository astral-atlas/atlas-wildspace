// @flow strict
/*::
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
    updater: (input: V) => Promise<V>,
    retries?: number
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
  const transaction = async (partitionKey, sortKey, updater, retries = 0) => {
    const Key = createKeyAttributes(partitionKey, sortKey);
    const output = await db.getItem({ TableName: tableName, Key });
    const prevValue = castValue(readValueTypes({ M: output.Item }));
    const version = createVersionAttributes(prevValue);
    const nextValue = await updater(prevValue);
    const nextItem = {
      ...writeObjectAttributes(nextValue),
      ...Key,
    };
    try {
      await db.putItem({
        Item: nextItem,
        TableName: tableName,
        ConditionExpression: '#v = :v',
        ExpressionAttributeNames: { '#v': version.key },
        ExpressionAttributeValues: { ':v': writeValueTypes(version.value) }
      });
    } catch (error) {
      if (retries < 1)
        throw error;
      return transaction(partitionKey, sortKey, updater, retries - 1);
    }
    return { prev: prevValue, next: nextValue };
  }
  return {
    transaction,
  };
};


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