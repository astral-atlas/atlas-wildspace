// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { DynamoDB } from "@aws-sdk/client-dynamodb";

import type { BufferDB, BufferStore } from "./sources/buffer";
import type { CompositeKey, CompositeTable, Table } from "./sources/table";
import type { Transactable } from "./sources/table2";
import type { Channel } from "./sources/channel";
import type { DynamoDBTable } from "./sources/dynamoTable";
import type {
  ExpirableCompositeTable,
  ExpiryTable,
  ExpiryTransactable,
} from "./sources/expiry";
*/

import { createBufferStore, createFileStreamBufferDB } from "./sources/buffer.js";
import {
  createBufferCompositeTable,
  createBufferTable,
  createDynamoDBCompositeTable,
  createDynamoDBSimpleTable,
} from "./sources/table.js";
import { createMemoryChannel } from "./sources/channel.js";
import { createMemoryBufferDB } from "./sources/buffer.js";
import {
  createDynamoDBTrasactable,
  createFakeTransactable,
} from "./sources/table2.js";
import {
  createDynamoDBExpirableTable, createDynamoDBExpiryTransactable,
} from "./sources/expiry.js";
import { createNamespacedDynamoDBTable } from "./sources/dynamoTable.js";
import { createLiveDynamoDBTable } from "./sources/dynamoTable.js";

/*::
export type WildspaceDataSources = {
  createCompositeTable<Item: {}>(
    uniqueKey: string,
    cast: Cast<Item>
  ): CompositeTable<string, string, Item>,
  createExpiryTable<Item: {}>(
    uniqueKey: string,
    cast: Cast<Item>
  ): ExpirableCompositeTable<string, string, Item>,
  createTransactable<Item: {}>(
    uniqueKey: string,
    cast: Cast<Item>,
    versionKey: string
  ): Transactable<string, string, Item>,
  createExpiryTransactable<Item: {}>(
    uniqueKey: string,
    cast: Cast<Item>,
  ): ExpiryTransactable<string, string, Item>,
  createDynamoDBTable<Item> (
    uniqueKey: string,
    cast: Cast<Item>,
  ): DynamoDBTable<string, string, Item>,
  createTable<Item: {}>(
    uniqueKey: string,
    cast: Cast<Item>
  ): Table<string, Item>,
  createChannel<V>(
    uniqueKey: string,
    cast: Cast<V>
  ): Channel<string, V>,
}
*/

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
  const createCompositeTable = /*:: <I: {}>*/(uniqueKey, c/*: Cast<I>*/)/*: CompositeTable<string, string, I>*/ => {
    return createDynamoDBCompositeTable(
      tableName,
      'Partition', 'Sort',
      pk => `${uniqueKey}:${pk}`,
      sk => `${sk}`,
      c,
      dynamodb,
    );
  };
  const createTable = /*:: <I: {}>*/(uniqueKey, c/*: Cast<I>*/)/*: Table<string, I>*/ => {
    return createDynamoDBSimpleTable(
      tableName,
      'Partition',
      'Sort',
      key => `${uniqueKey}:${key}`,
      c,
      dynamodb
    );
  };
  const createExpiryTable = /*:: <I: {}>*/(uniqueKey, c/*: Cast<I>*/)/*: ExpirableCompositeTable<string, string, I>*/ => {
    const table = createDynamoDBExpirableTable(
      dynamodb,
      tableName,
      c,
      'Partition',
      'Sort',
      'ExpiresBy'
    );

    return {
      get(key) {
        return table.get({ partition: `${uniqueKey}:${key.partition}`, sort: key.sort });
      },
      set(key, value, expiry) {
        return table.set({ partition: `${uniqueKey}:${key.partition}`, sort: key.sort }, value, expiry);
      },
      query(partition) {
        return table.query(`${uniqueKey}:${partition}`);
      }
    }
  };
  const createExpiryTransactable = /*:: <I: {}>*/(uniqueKey, castItem/*: Cast<I>*/)/*: ExpiryTransactable<string, string, I>*/ => {
    const transactable = createDynamoDBExpiryTransactable(
      dynamodb,
      tableName,
      castItem,
      'Partition',
      'Sort',
      'Version',
      'ExpiresBy'
    )
    return {
      get(key) {
        return transactable.get({ partition: `${uniqueKey}:${key.partition}`, sort: key.sort });
      },
      set(key, version, expiresBy, item) {
        return transactable.set({ partition:`${uniqueKey}:${key.partition}`, sort: key.sort }, version, expiresBy, item);
      }
    }
  };
  const createChannel = /*:: <V>*/(k, c/*: Cast<V>*/)/*: Channel<string, V>*/ => {
    const channel = channels.get(k) || createMemoryChannel();
    if (!channels.has(k))
      channels.set(k, channel);
    return channel;
  }
  const createDynamoDBTable = /*:: <Item>*/(uniqueKey, castItem/*: Cast<Item>*/)/*: DynamoDBTable<string, string, Item>*/ => {
    const table = createLiveDynamoDBTable(dynamodb, tableName, castItem,
      'Partition',
      'Sort',
      'Value',
      'ExpiresBy',
      'Version'
    );
    return createNamespacedDynamoDBTable(table, pk => `${uniqueKey}:${pk}`, x => x, x => x);
  }

  return {
    createCompositeTable,
    createTransactable,
    createTable,
    createExpiryTable,
    createDynamoDBTable,
    createExpiryTransactable,
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
  const createExpiryTable = () => {
    throw new Error();
  }
  const createExpiryTransactable = () => {
    throw new Error();
  }
  const createDynamoDBTable = () => {
    throw new Error();
  }
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
    createExpiryTable,
    createDynamoDBTable,
    createExpiryTransactable,
    createTable,
    createChannel,
  }
}

export const createFileSources = ()/*: WildspaceDataSources*/ => {
  throw new Error();
};

export const createSortRemappedExpiryTable = /*:: <PK, ASK, BSK, V: {}>*/(
  table/*: ExpirableCompositeTable<PK, BSK, V>*/,
  remapSort/*: ASK => BSK*/,
  unmapSort/*: BSK => ASK*/,
)/*: ExpirableCompositeTable<PK, ASK, V>*/ => {
  const remapKey = (key) => {
    return { partition: key.partition, sort: remapSort(key.sort) };
  }
  return {
    get(key) {
      return table.get(remapKey(key));
    },
    set(key, value, expiry) {
      return table.set(remapKey(key), value, expiry);
    },
    async query(partition) {
      const { results } = await table.query(partition);
      const remappedResults = results.map(result => ({
        ...result,
        key: unmapSort(result.key)
      }));
      return { results: remappedResults };
    }
  };
};


export * from './sources/dynamoTable.js';
