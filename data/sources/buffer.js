// @flow strict
import { S3 } from '@aws-sdk/client-s3';
import { promises } from 'fs';
import { join } from 'path';
import { createLockFunction } from './lock.js';
const { readFile, writeFile, unlink, mkdir, truncate } = promises;

/*::
export type BufferStore = {
  get: () => Promise<Buffer>,
  set: Buffer => Promise<void>
}
*/

export const createMemoryLockingStore = (store/*: BufferStore*/)/*: BufferStore*/ => {
  return {
    ...store,
    set: createLockFunction(store.set),
  }
};

export const createMemoryBufferStore = ()/*: BufferStore*/ => {
  let buffer = Buffer.alloc(0);
  return {
    async get() {
      return buffer;
    },
    async set(newBuffer) {
      buffer = newBuffer;
    }
  }
};
export const createFileBufferStore = (path/*: string*/)/*: BufferStore*/ => createMemoryLockingStore({
  async get() {
    return await readFile(path);
  },
  async set(newBuffer) {
    await writeFile(path, newBuffer);
  }
});
export const createS3BufferStore = (s3/*: S3*/, bucket/*: string*/, key/*: string*/)/*: BufferStore*/ => createMemoryLockingStore({
  async get() {
    const { Body } = await s3.getObject({ Bucket: bucket, Key: key });
    const buffers = [];
    for await (const chunk of Body)
      buffers.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
    return Buffer.concat(buffers);
  },
  async set(newBuffer) {
    await s3.putObject({ Body: newBuffer, Bucket: bucket, Key: key });
  }
});


/*::
export type BufferDB<K: string> = {
  get: (key: K) => Promise<{ result: null | Buffer }>,
  set: (key: K, input: null | Buffer) => Promise<void>,
}
*/

export const createFileStreamBufferDB = /*:: <K: string>*/(directoryPath/*: string*/)/*: BufferDB<K>*/ => {
  const get = async (key) => {
    try {
      const result = await readFile(join(directoryPath, key));
      return { result };
    } catch (error) {
      return { result: null };
    }
  };
  const set = async (key, value) => {
    try {
      if (!value)
        return await unlink(join(directoryPath, key));
      await writeFile(join(directoryPath, key), value);
    } catch (error) {
      console.warn(error);
      return;
    }
  };

  return { get, set };
};
export const createMemoryBufferDB = ()/*: BufferDB<string>*/ => {
  const db = new Map();
  const get = async (key) => {
    const buffer = db.get(key);
    return { result: buffer || null };
  };
  const set = async (key, value) => {
    if (value)
      db.set(key, value);
    else
      db.delete(key);
  }
  return { get, set };
}
export const createAWSS3BufferDB = (s3/*: S3*/, bucket/*: string*/, prefix/*: string*/)/*: BufferDB<string>*/ => ({
  async get (key) {
    const bucketKey = join(prefix, key);
    try {
      const { Body } = await s3.getObject({ Bucket: bucket, Key: bucketKey });
      const buffers = [];
      for await (const chunk of Body)
        buffers.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
      return { result: Buffer.concat(buffers) }
    } catch (error) {
      return { result: null };
    }
  },
  async set(key, buffer) {
    const bucketKey = join(prefix, key);
    if (buffer)
      await s3.putObject({ Body: buffer, Bucket: bucket, Key: bucketKey });
    else
      await s3.deleteObject({ Bucket: bucket, Key: bucketKey });
  }
});