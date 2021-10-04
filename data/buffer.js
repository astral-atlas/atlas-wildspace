// @flow strict
/*:: import type { Readable, Writable } from 'stream'; */
import { promises } from 'fs';
import { join } from 'path';
const { readFile, writeFile, unlink } = promises;

/*::
export type BufferStore<K: string> = {
  get: (key: K) => Promise<{ result: null | Buffer }>,
  set: (key: K, input: null | Buffer) => Promise<void>,
}
*/

export const createFileStreamBufferStore = /*:: <K: string>*/(directoryPath/*: string*/)/*: BufferStore<K>*/ => {
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
      return;
    }
  };

  return { get, set };
};
