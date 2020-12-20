// @flow strict
const { writeFile, readFile, mkdir } = require('fs').promises;
const { dirname } = require('path');
const { toArray } = require('@lukekaalim/cast');
const { createMemoryTable } = require('./memory.js');
/*::
import type { Cast } from '@lukekaalim/cast';
import type { ColumnMap, Selectable, Insertable, Named } from './main.js';

export type FileTable<Row: ColumnMap> =
  & Selectable<Row>
  & Insertable<Row>
  & Named
*/

const readFileOrDefault = async /*::<T>*/(
  filePath/*: string*/,
  defaultValue/*: T*/,
  toValue/*: Cast<T>*/,
)/*: Promise<T>*/ => {
  try {
    const fileContent = await readFile(filePath, 'utf8');
    const value = toValue(JSON.parse(fileContent));
    return value;
  } catch (error) {
    console.warn(error);
    return defaultValue;
  }
};

const createFileTable = async /*:: <R: ColumnMap>*/(
  name/*: string*/,
  filePath/*: string*/,
  toRow/*: Cast<R>*/,
)/*: Promise<FileTable<R>>*/ => {
  await mkdir(dirname(filePath), { recursive: true });
  const toRows = (value) => toArray(value).map(toRow);
  const initialValues = await readFileOrDefault(filePath, [], toRows);
  const internalTable = createMemoryTable(name);
  await internalTable.insert(initialValues);

  const withFilePersistence = async (func) => {
    const returnValue = await func();
    await writeFile(
      filePath,
      JSON.stringify(await internalTable.select({}) ,null, 2),
      'utf8'
    );
    return returnValue;
  };

  const select = internalTable.select;
  const update = (where, values) => withFilePersistence(async () => internalTable.update(where, values));
  const insert = (rows) => withFilePersistence(async () => internalTable.insert(rows));
  const remove = (where) => withFilePersistence(async () => internalTable.remove(where));

  return {
    name,
    select,
    update,
    insert,
    remove,
  };
};

module.exports = {
  createFileTable,
};
