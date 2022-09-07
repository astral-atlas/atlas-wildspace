// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { DynamoDB } from "@aws-sdk/client-dynamodb";

import type { BufferDB, BufferStore } from "./sources/buffer";
import type { CompositeTable, Table } from "./sources/table";
import type { Transactable } from "./sources/table2";
import type { Channel } from "./sources/channel";
import { createBufferStore, createFileStreamBufferDB } from "./sources/buffer";
import {
  createBufferCompositeTable,
  createBufferTable,
  createDynamoDBCompositeTable,
  createDynamoDBSimpleTable,
} from "./sources/table";
import { createMemoryChannel } from "./sources/channel";
*/

import { createMemoryBufferDB } from "./sources/buffer";
import {
  createDynamoDBTrasactable,
  createFakeTransactable,
} from "./sources/table2";

/*::
export type WildspaceDataSources = {
  createCompositeTable<Item>(
    uniqueKey: string,
    cast: Cast<Item>
  ): CompositeTable<string, string, Item>,
  createTransactable<Item: {}>(
    uniqueKey: string,
    cast: Cast<Item>,
    versionKey: string
  ): Transactable<string, string, Item>,
  createTable<Item>(
    uniqueKey: string,
    cast: Cast<Item>
  ): Table<string, Item>,
  createChannel<V>(
    uniqueKey: string,
    cast: Cast<V>
  ): Channel<string, V>,
}
*/

export const createNamespacedSources = (
  namespace/*: string*/,
  sources/*: WildspaceDataSources*/
)/*: WildspaceDataSources*/ => {
  return {
    createCompositeTable/*:: <I>*/(k, c)/*: CompositeTable<string, string, I>*/ {
      return sources.createCompositeTable(namespace + k, c);
    },
    createTransactable/*:: <I: {}>*/(k, c, cv)/*: Transactable<string, string, I>*/ {
      return sources.createTransactable(namespace + k, c, cv);
    },
    createTable/*:: <I>*/(k, c)/*: Table<string, I>*/ {
      return sources.createTable(namespace + k, c)
    },
    createChannel/*:: <V>*/(k, c)/*: Channel<string, V>*/ {
      return sources.createChannel(namespace + k, c)
    }
  }
};

export const createAWSSources = (
  dynamodb/*: DynamoDB*/,
  tableName/*: string*/
)/*: WildspaceDataSources*/ => {
  const channels = new Map/*:: <string, Channel<string, any>>*/();

  const createTransactable = /*:: <V: {}>*/(uniqueKey, c/*: Cast<V>*/, vk)/*: Transactable<string, string, V>*/ => {
    return createDynamoDBTrasactable(
      dynamodb,
      tableName,
      c,
      (pk, sk) => ({
        ['Partition']: { S: `${uniqueKey}:${pk}` },
        ['Sort']: { S: sk }
      }),
      vk,
    );
  };
  const createCompositeTable = /*:: <I>*/(uniqueKey, c/*: Cast<I>*/)/*: CompositeTable<string, string, I>*/ => {
    return createDynamoDBCompositeTable(
      tableName,
      'Partition', 'Sort',
      pk => `${uniqueKey}:${pk}`,
      sk => `${sk}`,
      c,
      dynamodb,
    );
  };
  const createTable = /*:: <I>*/(uniqueKey, c/*: Cast<I>*/)/*: Table<string, I>*/ => {
    return createDynamoDBSimpleTable(
      tableName,
      'Partition', 'Sort',
      key => `${uniqueKey}:${key}`,
      c,
      dynamodb
    );
  };
  const createChannel = /*:: <V>*/(k, c/*: Cast<V>*/)/*: Channel<string, V>*/ => {
    const channel = channels.get(k) || createMemoryChannel();
    if (!channels.has(k))
      channels.set(k, channel);
    return channel;
  }

  return {
    createCompositeTable,
    createTransactable,
    createTable,
    createChannel,
  }
};

export const createMemorySources = ()/*: WildspaceDataSources*/ => {
  const bufferDB = createMemoryBufferDB();
  const channels = new Map/*:: <string, Channel<string, any>>*/();
  
  const createCompositeTable = /*:: <I>*/(k, c/*: Cast<I>*/)/*: CompositeTable<string, string, I>*/ => {
    return createBufferCompositeTable(createBufferStore(bufferDB, k), c);
  };
  const createTransactable = /*:: <I: {}>*/(k, c/*: Cast<I>*/, vk)/*: Transactable<string, string, I>*/ => {
    return createFakeTransactable(createCompositeTable(k, c));
  };
  const createTable = /*:: <I>*/(k, c/*: Cast<I>*/)/*: Table<string, I>*/ => {
    return createBufferTable(createBufferStore(bufferDB, k), c);
  };
  const createChannel = /*:: <V>*/(k, c/*: Cast<V>*/)/*: Channel<string, V>*/ => {
    const channel = channels.get(k) || createMemoryChannel();
    if (!channels.has(k))
      channels.set(k, channel);
    return channel;
  }
    
  return {
    createCompositeTable,
    createTransactable,
    createTable,
    createChannel,
  }
}

export const createFileSources = ()/*: WildspaceDataSources*/ => {
  throw new Error();
};
